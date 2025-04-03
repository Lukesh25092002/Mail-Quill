const organisationInvitationTemplate = `
<html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        color: #333;
        background-color: #F7F7F7;
        margin: 0;
        padding: 0;
      }
      .container {
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
        background-color: #FFFFFF;
        padding: 40px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      }
      .header {
        text-align: center;
        margin-bottom: 30px;
        color: #2C3E50;
      }
      .header img {
        max-width: 100px;
        border-radius: 50%;
        margin-bottom: 15px;
      }
      .header h1 {
        font-size: 36px;
        margin: 0;
        color: #DB3B17;
      }
      .content {
        text-align: center;
        margin-bottom: 30px;
        color: #333;
      }
      .content h2 {
        font-size: 28px;
        margin-bottom: 10px;
        color: #2C3E50;
      }
      .content p {
        font-size: 16px;
        line-height: 1.5;
        margin-bottom: 20px;
        color: #555;
      }
      .details {
        text-align: left;
        margin: 20px 0;
        font-size: 14px;
        color: #555;
      }
      .details p {
        margin: 5px 0;
      }
      .button {
        display: inline-block;
        background-color: #3498DB;
        color: white;
        padding: 12px 30px;
        text-decoration: none;
        border-radius: 5px;
        font-size: 18px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        transition: background-color 0.3s ease, transform 0.2s;
      }
      .button:hover {
        background-color: #2980B9;
        transform: translateY(-2px);
      }
      .footer {
        text-align: center;
        font-size: 12px;
        color: #888;
        margin-top: 30px;
      }
      .footer p {
        margin: 5px 0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="<%= organisationPicture %>" alt="<%= organisationName %> Logo">
        <h1><%= organisationName %></h1>
        <p>Organization Invitation</p>
      </div>
      <div class="content">
        <h2>You're Invited to Join <%= organisationName %></h2>
        <p>Hello <strong><%= userEmail %></strong>,</p>
        <p>You have been invited to join the <strong><%= organisationName %></strong> organization as a <strong><%= userRole %></strong>.</p>
        <p>Click the button below to accept your invitation and get started:</p>
        <a href="<%= invitationLink %>" class="button">Accept Invitation</a>
      </div>
      <div class="details">
        <h3>Organization Details</h3>
        <p><strong>Name:</strong> <%= organisationName %></p>
        <p><strong>Email:</strong> <%= userEmail %></p>
        <p><strong>Role:</strong> <%= userRole %></p>
      </div>
      <div class="footer">
        <p>If you did not request this, please ignore this email.</p>
        <p>&copy; 2025 Angular Minds</p>
      </div>
    </div>
  </body>
</html>
`;

export default organisationInvitationTemplate;