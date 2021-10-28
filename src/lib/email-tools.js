import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Do not forget this and double check that process.env.SENDGRID_KEY is NOT undefined

export const sendNewPostEmail = async (recipientAddress, post) => {
  const msg = {
    to: recipientAddress,
    from: process.env.SENDER_EMAIL,
    subject: "Your most recent post",
    text: "and easy to do anywhere, even with Node.js",
    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml" lang="en">
  
  <head><link rel="stylesheet" type="text/css" hs-webfonts="true" href="https://fonts.googleapis.com/css?family=Lato|Lato:i,b,bi">
    <title>Email template</title>
    <meta property="og:title" content="Email template">
    
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

<meta http-equiv="X-UA-Compatible" content="IE=edge">

<meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <style type="text/css">
   
      a{ 
        text-decoration: underline;
        color: inherit;
        font-weight: bold;
        color: #253342;
      }
      
      h1 {
        font-size: 56px;
      }
      
        h2{
        font-size: 28px;
        font-weight: 900; 
      }
      
      p {
        font-weight: 100;
      }
      
      td {
    vertical-align: top;
      }
      
      #email {
        margin: auto;
        width: 600px;
        background-color: white;
      }
      
      button{
        font: inherit;
        background-color: #FF7A59;
        border: none;
        padding: 10px;
        text-transform: uppercase;
        letter-spacing: 2px;
        font-weight: 900; 
        color: white;
        border-radius: 5px; 
        box-shadow: 3px 3px #d94c53;
      }
      
      .subtle-link {
        font-size: 9px; 
        text-transform:uppercase; 
        letter-spacing: 1px;
        color: #CBD6E2;
      }
      
    </style>
    
  </head>
    
    <body bgcolor="#F5F8FA" style="width: 100%; margin: auto 0; padding:0; font-family:Lato, sans-serif; font-size:18px; color:#33475B; word-break:break-word">
  
 <! View in Browser Link --> 
      
<div id="email">
      <table align="right" role="presentation">
        <tr>
          <td>
          <a class="subtle-link" href="#">View in Browser</a>
          </td>
          <tr>
      </table>
  
  
  <! Banner --> 
         <table role="presentation" width="100%">
            <tr>
         
              <td bgcolor="#00A4BD" align="center" style="color: white;">
            
             <img alt="Flower" src="https://hs-8886753.f.hubspotemail.net/hs/hsstatic/TemplateAssets/static-1.60/img/hs_default_template_images/email_dnd_template_images/ThankYou-Flower.png" width="400px" align="middle">
                
                <h1> HELLOOOO ${post.author.name}</h1> </h1>
                
              </td>
        </table>
  
  
  
  
    <! First Row --> 
  
  <table role="presentation" border="0" cellpadding="0" cellspacing="10px" style="padding: 30px 30px 30px 60px;">
     <tr>
       <td>
        <h2> Your Post:</h2>
            <p>
              ${post.content}
            </p>
          </td> 
          </tr>
                 </table>
  
  <! Second Row with Two Columns--> 
  
    <table role="presentation" border="0" cellpadding="0" cellspacing="10px" width="100%" style="padding: 30px 30px 30px 60px;">
      <tr>
          <td> 
           <img alt="Blog" src=${post.cover} width="200px" align="middle">
            
         <h2> Vivamus ac elit eget </h2>
            <p>
              Vivamus ac elit eget dolor placerat tristique et vulputate nibh. Sed in elementum nisl, quis mollis enim. Etiam gravida dui vel est euismod, at aliquam ipsum euismod. 
      
              </p>
  
          </td>
        
          <td>
            
            <img alt="Shopping" src="https://www.hubspot.com/hubfs/assets/hubspot.com/style-guide/brand-guidelines/guidelines_sample-illustration-5.svg" width="200px" align="middle">
         <h2> Suspendisse tincidunt iaculis </h2>
            <p>
              Suspendisse tincidunt iaculis fringilla. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Cras laoreet elit purus, quis pulvinar ipsum pulvinar et. 
      
              </p> 
          </td>
          </tr>
      
            <tr>
              <td> <button> Button 2 </button> </td> 
              <td> <button> Button 3 </button> </td> 
              
  </table>
     
        <! Banner Row --> 
  <table role="presentation" bgcolor="#EAF0F6" width="100%" style="margin-top: 50px;" >
      <tr>
          <td align="center" style="padding: 30px 30px;">
            
         <h2> Nullam porta arcu </h2>
            <p>
              Nam vel lobortis lorem. Nunc facilisis mauris at elit pulvinar, malesuada condimentum erat vestibulum. Pellentesque eros tellus, finibus eget erat at, tempus rutrum justo. 
      
              </p>
              <a href="#"> Ask us a question</a>      
          </td>
          </tr>
      </table>
  
        <! Unsubscribe Footer --> 
      
  <table role="presentation" bgcolor="#F5F8FA" width="100%" >
      <tr>
          <td align="left" style="padding: 30px 30px;">
            <p style="color:#99ACC2"> Made with &hearts; at HubSpot HQ </p>
              <a class="subtle-link" href="#"> Unsubscribe </a>      
          </td>
          </tr>
      </table> 
      </div>
    </body>
      </html>`,
  };

  await sgMail.send(msg);
};
