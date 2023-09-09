
const signing = { acc_F: "Account already registered", google: "Email registered with Google. Use Google login.", pass_inc: "Incorrect Password", acc_nf: "No account found", otp_inc: "Incor0rect OTP", ok: "all ok" }
const Mail = {
    welcome: () => ({
        subject: `Welcome to WebChat`,
        content: `
        <h2><strong>Welcome to a New Chat Experience!</strong></h2>

        <p>We're absolutely thrilled to welcome you to WebChat, where we've redefined the way you connect and communicate with others. As you embark on this journey with us, you're about to discover a world of possibilities for seamless and enriching conversations.</p>
        
        <p>At WebChat, our mission is to make every interaction meaningful, whether it's for business, staying in touch with friends and family, or meeting new people. We've poured our hearts and minds into creating a platform that not only simplifies messaging but also elevates it to a whole new level of real-time engagement.</p>
        
        <p>As you navigate through WebChat, you'll find a treasure trove of features designed to enhance your experience. From lively group chats to private conversations, from video calls that bridge distances to emojis that convey your every emotion — we've got it all covered. Our user-friendly interface ensures you're always in control, making every interaction a breeze.</p>
        
        <p>But it's not just about features; it's about the people behind the screen. Our dedicated support team is always here, around the clock, ready to assist you with any questions or concerns you may have. We're not just a platform; we're your partners in ensuring your WebChat experience is nothing short of exceptional.</p>
        
        <p>We understand that your time is precious, and we appreciate your trust in choosing WebChat as your go-to platform. Together, let's embark on a journey of memorable conversations and meaningful connections. After all, it's not just about chatting; it's about building relationships that last.</p>
        
        <p>Thank you for being a part of the WebChat community. Here's to a future filled with unforgettable moments!</p>
        
        <p>Best regards,</p>
        
        <p>The WebChat Team</p>
        
            `
    })
    , new_OTP: (user_name, OTP) => ({
        subject: "Your OTP for WebChat",
        content: `
        <h2>Dear ${user_name},</h2>
        <p>Here is your One-Time Password (OTP) to access your account on <strong>WebChat</strong>:</p>
        <h2 style="text-align: center; font-size: 24px; font-weight: bold;">${OTP}</h2>
        <p>If you did not request this OTP or need any assistance, please contact our support team immediately on <strong>webchat_support@example.com</strong>.</p>
        <p>Thank you for using <strong>WebChat</strong>.</p>
        <p>Best regards,</p>
        <p><strong>Team (WebChat)</strong></p>;`
    })
    , forget_OTP: (OTP) => ({
        subject: "Password change request for WebChat",
        content: `
        <h2>Dear User,</h2>
        <p>We have received a request to reset your password on <strong>WebChat</strong>. If you didn't initiate this request, you can safely ignore this email.</p>
        <p>Here is your One-Time Password (OTP) to proceed with the password reset:</p>
        <h2 style="text-align: center; font-size: 24px; font-weight: bold;">${OTP}</h2>
        <p>If the OTP is correct, you will be redirected to a page where you can reset your password securely.</p>
        <p>If you have any questions or need assistance, please feel free to contact our support team.</p>
        <p>Thank you for using <strong>WebChat</strong>.
        <br/>
        Best regards,
        <br/>
        <strong>Team (WebChat)</strong></p>`
    })

}

module.exports = { signing: signing, Mail: Mail }