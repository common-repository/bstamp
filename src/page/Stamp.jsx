import {React, useEffect, useState} from 'react';
import { Col, Form, InputGroup, FormGroup, Input, Button, InputGroupAddon, InputGroupText } from "reactstrap";
import axios from 'axios';
import LoaderComponent from './../components/LoaderComponent';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';



const Stamp = ({ post_id, post_meta, hashed_content, stamp_active, post_current_screen, nonce_field}) => {	
	const toastSuccess = (message) => {
      toast.success(message, {
        position: "bottom-left",
        style: {
          color: "#000",
          minWidth: 150,
          padding: 10,
          fontWeight: 500,
          marginBottom: 60,
          border: "1px solid #073E84"
        },
        iconTheme: { primary: "#073E84 ", secondary: "#fff" }
      });
    };

	const toastError = (message) => {
      toast.error(message, {
        position: "bottom-left",
        style: {
          color: "#000",
          fontWeight: 500,
          padding: 10,
          marginBottom: 60,
          border: "1px solid #ff0000"
        }
      });
    };

	const [isLoader, setIsloader] = useState(false);
	const [buttonDisabled, setButtonDisabled] = useState(false);

	const onSubmitPostStamp = () => {
      	setIsloader(true);
		setButtonDisabled(false);
		const originalContent = wp.data.select("core/editor").getCurrentPost().content;
		const editedContent = wp.data.select("core/editor").getEditedPostContent();
		if (originalContent !== editedContent) {
			toastError('Please save your post before stamping');
			setButtonDisabled(false);
			setIsloader(false);
            return;
		}else if(editedContent == ""){
			toastError('Please save your post before stamping');
			setButtonDisabled(false);
			setIsloader(false);
            return;
		}

    	let formData = new FormData();
        formData.append('action', 'bstamp_perform_stamping');
        formData.append('post_id', post_id);
        formData.append('bstamp_ex_wp_post_nonce', nonce_field);
        axios.post(ajaxUrls.ajax_url, formData).then(function(response){
          	if(response.data.success){
          		toastSuccess(response.data.success); 
          	}else{
          		toastError(response.data.error); 
          	}
          	setIsloader(false);
        }).catch(err => setIsloader(false));
	}

	return (
		<>	
		<Toaster/>
		{isLoader ? <LoaderComponent/>:null}
		{ !post_meta.stamped ? <div className="inside inside--actual">
        	<label for="bstamp_ex_wp_hash">SHA256 hash derived from last save</label>
        	<Input id="bstamp_ex_wp_hash" class="full-width" type="text" autocomplete="off"
               placeholder="Hash not calculated yet"
               name="bstamp_ex_wp_hash" value={hashed_content} readonly />
               <Input type="hidden" name="bstamp_ex_wp_post_nonce" id="nonce_user_field" value={nonce_field} />
    	     </div> : hashed_content === post_meta.hash ? <div>
    			<p>
                <span class="dashicons dashicons-lock"></span>This post has been stamped on the blockchain via <a href="https://accounts.io-world.com" target="_blank">edeXa.com</a>
            	</p> 
            	<label for="bstamp_ex_wp_hash">SHA256 hash</label>
            	<Input id="bstamp_ex_wp_hash" class="full-width" type="text" autocomplete="off"
                   placeholder="Hash not calculated yet"
                   name="bstamp_ex_wp_hash" value={hashed_content} readonly/>
                <label for="bstamp_ex_wp_txid">Transaction ID
	               <small><a class="float-right"
	                          target="_blank"
	                          href={post_meta.link}>View transaction</a>
	               </small>
	            </label>
	            <Input id="bstamp_ex_wp_txid" class="full-width" type="text" autocomplete="off"
                   name="bstamp_ex_wp_txid" value={post_meta.txid} readonly />
	            <label for="bstamp_ex_wp_date">Date</label>
	            <Input id="bstamp_ex_wp_date" class="full-width" type="text" autocomplete="off"
	                   name="bstamp_ex_wp_date" value={post_meta.date} readonly />
            	</div> : <div>
			<label for="bstamp_ex_wp_hash">SHA256 hash derived from last save</label>
            <Input id="bstamp_ex_wp_hash" class="full-width" type="text" autocomplete="off"
                   placeholder="Hash not calculated yet"
                   name="bstamp_ex_wp_hash" value={hashed_content} readonly/>
            <p class="description">An older revision of this post is stamped on the blockchain. Return to the previous revision or stamp the new hash.</p></div>
            	 }
        
    	{ stamp_active === "" ? <div id="major-publishing-actions"><div id="delete-action">
            <div class="js-bstamp-post-changed" >
				Please <strong>update</strong> the post
            </div>
            <div class="js-bstamp-post-settings">
                <a href="admin.php?page=bstamp">Settings</a>
            </div>
        </div><div id="publishing-action">
            <Button className="edexa-button-color" onClick={onSubmitPostStamp} disabled={buttonDisabled}>Submit</Button>
        </div><div class="clear"></div>
        </div> : "" }
		</>
     );
}


export default Stamp;