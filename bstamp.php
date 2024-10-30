<?php
/**
 * Plugin Name: bStamp
 * Description: A bStamp plugin that helps protect your rights in your digital creations by posting a unique imprint of your posts on the blockchain.
 * Requires at least: 5.8
 * Requires PHP: 7.0
 * Version: 0.1.0
 * Author: edeXa
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: bstamp
 */

if( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

global $version, $pluginPrefix, $APIBaseURL, $APIBaseHashURL;
$version = '0.1.0';
$pluginPrefix='bstamp_edexa_wp_'; 
$APIBaseURL = 'https://api-edexagw.edexa.com/bstamp/authenticate'; 
$APIBaseHashURL = 'https://api-edexagw.edexa.com/bstamp';

/**
 *  Define URL constant to our plugin directory.
 *
 *  @since 6.0.0
 */
if ( ! defined( 'BSTAMP_URL' ) ) {
    define( 'BSTAMP_URL', plugin_dir_url( __FILE__ ) );
}

add_action( 'admin_menu', 'bstamp_init_menu' );

/**
 * Init Admin Menu.
 *
 * @return void
 */
function bstamp_init_menu() {
    add_menu_page( __( 'bStamp', 'bstamp'), __( 'bStamp', 'bstamp'), 'manage_options', 'bstamp', 'bstamp_page', BSTAMP_URL.'includes/images/bstamp-icon.svg', '80' );
}


/**
 * Init Admin Page.
 *
 * @return void
 */
function bstamp_page() {
    require_once plugin_dir_path( __FILE__ ) . 'templates/app.php';
}


/**
 * Save User Credential.
 *
 * @return void
 */
function bstamp_saveUserCredential() {
    if(wp_verify_nonce($_POST['bstamp_edexa_user_field_wp_nonce'],'bstamp_saveUserCredential')){      
        $clientId = sanitize_text_field( $_POST['clientId'] );
        $secreteId = sanitize_text_field( $_POST['secreteId'] );
        $resultStatus = bstamp_apiInitCall( $clientId, $secreteId );
        if( $resultStatus->status == 200 ){
            update_option( 'bstamp_clientId', $clientId ); 
            update_option( 'bstamp_secreteId', $secreteId ); 
            return wp_send_json($resultStatus->data);
        }else{
            return wp_send_json($resultStatus);
        }
        wp_create_nonce('wp_rest');
    }
}
add_action('wp_ajax_bstamp_saveUserCredential', 'bstamp_saveUserCredential');
add_action('wp_ajax_nopriv_bstamp_saveUserCredential', 'bstamp_saveUserCredential');


/**
 * Get User Credential.
 *
 * @return void
 */
function bstamp_getUserCredentialData() {
    $clientId = get_option('bstamp_clientId');
    $secreteId = get_option('bstamp_secreteId');
    return wp_send_json(['clientId' => $clientId,'secreteId' => $secreteId]);
}
add_action('wp_ajax_bstamp_getUserCredentialData', 'bstamp_getUserCredentialData');
add_action('wp_ajax_nopriv_bstamp_getUserCredentialData', 'bstamp_getUserCredentialData');


/*
 * Hook metaboxes to actions
 */
if ( is_admin() ) {
    add_action( 'load-post.php', 'bstamp_hookPostMetabox' );
    add_action( 'load-post-new.php', 'bstamp_hookPostMetabox' );
}


/*
 * Hook post metabox
 */
function bstamp_hookPostMetabox() {
    add_action( 'add_meta_boxes', 'bstamp_addPostMetabox' ) ;
    add_action( 'save_post', 'bstamp_savePostMetabox' , 9999, 2 );
}

/*
 * Save post //  $pluginPrefix . 'post_metabox'
 */
function bstamp_savePostMetabox( $post_id ) {

    global $APIBaseURL;
    global $APIBaseHashURL;
    $in_ajax_mode = ! $post_id;

    if(!isset($_POST['bstamp_ex_wp_post_nonce'])){
        return $post_id;
    }

    if ( $in_ajax_mode ) {
        $post_id = sanitize_text_field( $_REQUEST['post_id'] );
    }


    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
        if ( $in_ajax_mode ) {
            return wp_send_json(['error' => 'Please save your post before stamping','postId' => $post_id]);
        }
        return $post_id;
    }

    if(!wp_verify_nonce($_POST['bstamp_ex_wp_post_nonce'],'bstamp_perform_stamping')){ 
        if ( $in_ajax_mode ) {
            return wp_send_json(['error' => 'Error in stamping, please try again.','postId' => $post_id]);
        }
        return $post_id;
    }
    
    if ( ! $in_ajax_mode ) {
        global $post;
    } else {
        $post = get_post( $post_id );
    }

    $client_id  = get_option( 'bstamp_clientId' );
    $secret_key = get_option( 'bstamp_secreteId' );
    $hash       = hash( 'sha256', base64_encode( $post->post_content ) );
    
    $init       = bstamp_apiInitCall( $client_id, $secret_key );
    $valid_init = bstamp_isValidLogin( $init );

    $token_id = $init->data->token;

    // Post hash
    $fields = array(
        'hash'          => $hash,
        'filename'      => $post->post_title.".wp",
    );

    $post_response = bstamp_performPostCall( $APIBaseHashURL . '/stamp-text', $fields, 'Bearer '.$token_id, $client_id, $secret_key);

    if (  $post_response['raw']['response']) {
            $code = $post_response['json']->status;

            if ( $code === 409 ) {
               return wp_send_json(['error' => 'This post has already been stamped.','postId' => $post_id]);
            } else if ( $code === 200 ) {

                bstamp_savePostBStampMeta( $post_id, array(
                    'stamped'    => true,
                    'date'       => date( 'Y-m-d', current_time( 'timestamp', 0 ) ),
                    'hash'       => $hash,
                    'txid'       => $post_response['json']->data->txid,
                ) );

                return wp_send_json(['success' => 'Post stamped successfully.','postId' => $post_id]);
            }

        } else {
            return wp_send_json(['error' => 'There was an error with your stamping. Please try again.','postId' => $post_id]);
        }
}

add_action( 'wp_ajax_bstamp_perform_stamping', 'bstamp_savePostMetabox' );
add_action( 'wp_ajax_nopriv_bstamp_perform_stamping', 'bstamp_savePostMetabox' ) ;


/*
 * Add post metabox
 */
function bstamp_addPostMetabox() {
    add_meta_box(
        'bstamp_post_metabox',
        __( 'edeXa Blockchain Stamping', 'bStamp' ),
        'bstamp_renderPostMetabox',
        array( 'post', 'page' ),
        'side',
        'default'
    );
}


function bstamp_renderPostMetabox($post) {
    $hashed_content   = hash( 'sha256', $post->post_content );
    $stamp_active     = false;
    $post_meta = json_encode( bstamp_getPostBStampMeta( $post->ID ) );
    $current_screen = get_current_screen()->is_block_editor;

    require_once 'templates/post-metabox.php';
}


/*
 * Save post bStamp meta
 *
 * @param $post_id string
 * @return mixed
 */
function bstamp_savePostBStampMeta( $post_id, $meta ) {
    return update_post_meta( $post_id, 'bstamp_meta', $meta );
}


/*
 * Get post bStamp meta
 *
 * @param $post_id string
 * @return mixed
 */
function bstamp_getPostBStampMeta( $post_id ) {
    return get_post_meta( $post_id, 'bstamp_meta', true );
}


/*
 * Perform get call
 *
 * @param $url string
 * @return JSON, false
 */
function bstamp_performGetCall( $url, $client_id, $secret_key ) {
    $performGetCallResult = wp_remote_post( $url, array( 'timeout' => 10,
                                        'headers' => array( 'client-id' => $client_id,
                                        'secret-key'=> $secret_key 
                                      ) ));
    return json_decode( $performGetCallResult['body'] );
}


/*
 * API /init
 *
 * @param $client_id string
 * @param $secret_key string
 * @return _bstamp_performGetCall
 */
function bstamp_apiInitCall( $client_id, $secret_key ) {
    global $APIBaseURL;
    $url = $APIBaseURL;
    return bstamp_performGetCall( $url, $client_id, $secret_key );
}


/*
 * Check init validity
 *
 * @return boolean
 */
function bstamp_isValidLogin( $init_ressult ) {
    if ( $init_ressult && is_object( $init_ressult ) && property_exists( $init_ressult, 'status' ) && ( in_array( $init_ressult->status, array(
            200, // already logged
            300 // success login
        ) ) )
    ) {
        return true;
    } else {
        return false;
    }
}


/**
 * Enqueue scripts and styles.
 *
 * @return void
 */
add_action( 'admin_enqueue_scripts', 'bstamp_enqueue_scripts' );
function bstamp_enqueue_scripts() {
    wp_enqueue_style( 'bstamp-style', BSTAMP_URL . 'build/index.css' );
    wp_enqueue_script( 'bstamp-script', BSTAMP_URL . 'build/index.js', array( 'wp-element' ), '1.0.0', true );
    wp_localize_script('bstamp-script', 'ajaxUrls', array(
        'ajax_url' => admin_url( 'admin-ajax.php' ),
        'plugin_url' => BSTAMP_URL,
    ));
    wp_enqueue_script('bstamp-script');
}


/*
 * Perform post call
 *
 * @param $url string
 * @param $fields array of strings
 * @return JSON, false
 */
function bstamp_performPostCall( $url, $fields = array(), $token_id, $client_id, $secret_key ) {
    $performPostCallResult = wp_remote_post( $url, array('timeout' => 10,
                        'headers' => array(
                                    'Content-Type: application/json',
                                            'Authorization' => $token_id,
                                            'client-id' => $client_id,
                                                'secret-key'=> $secret_key
                                            ),
                                    'body'        => array(
                                                'hash' => $fields['hash'],
                                    'filename' => $fields['filename'],
                                    'type' => 5
                                ),
                                ));

    return array(
        'json'   => json_decode( $performPostCallResult['body'] ),
        'raw'    => $performPostCallResult,
        'fields' => array(  
                    'hash' => $fields['hash'],
                    'filename' => $fields['filename'],
                ),
        'url'    => $url,
    );
}
?>