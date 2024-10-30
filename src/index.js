import App from "./App";
import { render } from '@wordpress/element';
import Stamp from "./page/Stamp";


/**
 * Import the stylesheet for the plugin.
 */
import './style/main.scss';
import 'bootstrap/dist/css/bootstrap.min.css';


if(location.pathname.includes("admin.php")){
    (function ($) {
        let bStamp = document.getElementById('bstamp');
        let nonceUserField = $(bStamp).data('nonce-user-field');
        $(document).ready(function () {
            render(<App nonce_user_field={nonceUserField}/>, document.getElementById('bstamp'));
        });
    })(jQuery);
}else{
    (function ($) {
        let app = document.getElementById('product-app');
        let postId = $(app).data('post-id');
        let hashedContent = $(app).data('hashedContent');
        let stampActive = $(app).data('stamp-active');
        let postMeta = $(app).data('post-meta');
        let postCurrentScreen = $(app).data('post-current-screen');
        let nonceField = $(app).data('nonce-field-post');
        $(document).ready(function () {
          render(<Stamp post_id={postId} post_meta={postMeta} hashed_content={hashedContent} stamp_active={stampActive} post_current_screen={postCurrentScreen} nonce_field={nonceField} />, document.getElementById('product-app'));
        });
    })(jQuery);
}