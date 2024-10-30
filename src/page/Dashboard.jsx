import { React, useEffect, useState } from 'react';
import { Col, Form, InputGroup, FormGroup, Input, Button, InputGroupAddon, InputGroupText } from "reactstrap";
import axios from 'axios';
import toast from 'react-hot-toast';

const Dashboard = ({ setIsloader, setUserField}) => {
  // console.log(setUserField.nonce_user_field);
  // return false;
  const [clientId, setClientId] = useState("");
  const [secreteId, setSecreteId] = useState("");
  const [error, setError] = useState({
    clientId:false,
    secreteId:false
  })

  const toastSuccess = (message) => {
    toast.success(message, {
      position: "bottom-right",
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
      position: "bottom-right",
      style: {
        color: "#000",
        fontWeight: 500,
        padding: 10,
        marginBottom: 60,
        border: "1px solid #ff0000"
      }
    });
  };

  const onUserSignin = () => {
    if(error.clientId && error.secreteId){
        setIsloader(true);
        let formData = new FormData();
        formData.append('action', 'bstamp_saveUserCredential');
        formData.append('clientId', clientId);
        formData.append('secreteId', secreteId);
        formData.append('bstamp_edexa_user_field_wp_nonce', setUserField.nonce_user_field);
        axios.post(ajaxUrls.ajax_url, formData).then(function (response) {
          if (response.data.status == 1) {
            toastSuccess("Account is Verified.");
          } else if (response.data.status == 404) {
            toastError("Data Not Found.");
          } else if (response.data.status == 400) {
            toastError("Bad Request.");
          } else if (response.data.status == 401) {
            toastError("Unauthorized User.");
          } else if (response.data.status == 403) {
            toastError("Forbidden");
          } else if (response.data.status == 406) {
            toastError("Not Acceptable.");
          } else if (response.data.status == 409) {
            toastError("Conflict.");
          } else if (response.data.status == 422) {
            toastError("Unprocessable Entity.");
          } else if (response.data.status == 423) {
            toastError("Locked.");
          } else if (response.data.status == 425) {
            toastError("Too Early.");
          } else if (response.data.status == 429) {
            toastError("Too Many Requests.");
          } else if (response.data.status == 500) {
            toastError("Internal Server Error.");
          } else if (response.data.status == 503) {
            toastError("Under Maintenance.");
          }
          setIsloader(false)
        }).catch(err => setIsloader(false));
    } 
  }


  const getDataAction = () => {
    setIsloader(true)
    axios.get(ajaxUrls.ajax_url + '?action=bstamp_getUserCredentialData').then(function (response) {
      setClientId(response.data.clientId)
      setSecreteId(response.data.secreteId)
      setIsloader(false)

    }).catch(err => setIsloader(false));;
  }
  useEffect(() => {
    getDataAction();
  }, []);


const handleCheck = (boolean) =>{
  if(secreteId && clientId){
    return false
  }else{
    return true
  }
}

const resetValue =() =>{
    setClientId('');
    setSecreteId('');
    setError({
        clientId: false,
        secreteId: false
    })
}

 const logoUrl = ajaxUrls.plugin_url + "includes/images/bstamp-icon.svg";

  return (
    <div className="App">
        <div className="d-flex justify-content-center">
            <img src={logoUrl} className='bstamp-logo-image '/>
        </div>
        <Form className="form">
            <FormGroup>
              <label for="setClientid">Client ID</label>
              <Input
                type="text"
                name="setClientid"
                id="setClientid"
                className = ""
                value={clientId}
                placeholder="sedcs5d7-4569-53x8-cd54-845213654f74"
                onChange={(e) => {
                  setError({...error,clientId:true})
                    setClientId(e.target.value)}}
                invalid={error.clientId ? !clientId : false} 
              />
              {
               error.clientId ?  clientId ? null :  <span class="validation-error">Please Enetr Client ID</span>:null
              }
            </FormGroup>
        <FormGroup>
          <label for="secretkey">Secret Key</label>
          <Input
            type="password"
            name="secretkey"
            id="secretkey"
            placeholder="************************"
            value={secreteId}
            onChange={(e) => {
              setError({...error,secreteId:true})
              setSecreteId(e.target.value)}}
            invalid={error.secreteId ? !secreteId : false}

          />
          {
           error.secreteId ? secreteId ? null :  <span class="validation-error">Please Enetr Secret Key</span> :null
          }
          <Input
            type="hidden"
            name="bstamp_ex_wp_user_nonce"
            id="nonce_user_field"
            value={setUserField.nonce_user_field}
          />
        </FormGroup>
        <Button className="mr-3 edexa-button-color mt-3" onClick={onUserSignin}
         disabled={handleCheck()}
         >Submit</Button>
        <Button className="edexa-button-color mt-3" onClick={resetValue}>Reset</Button>
      </Form>
    </div>
  );
}

export default Dashboard;

