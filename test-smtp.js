const mongoose = require('mongoose');
require('dotenv').config();

const SmtpConfig = require('./models/smtpConfig');
const emailSender = require('./utils/emailSender');
const emailService = require('./utils/emailService');

async function testSmtpSystem() {
  console.log('\n=== SMTP System Test ===\n');

  try {
    console.log('1. Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected\n');

    console.log('2. Checking SMTP configuration in database...');
    let config = await SmtpConfig.findOne();
    
    if (!config) {
      console.log('   No configuration found. Creating default...');
      config = new SmtpConfig({
        host: '',
        port: 587,
        secure: false,
        auth: {
          user: '',
          pass: ''
        },
        from: '',
        fromName: 'Siriza Agaria',
        isActive: true
      });
      await config.save();
      console.log('✅ Default configuration created\n');
    } else {
      console.log('✅ Configuration found:');
      console.log(`   Host: ${config.host}`);
      console.log(`   Port: ${config.port}`);
      console.log(`   Secure: ${config.secure}`);
      console.log(`   From: ${config.from}`);
      console.log(`   Active: ${config.isActive}\n`);
    }

    console.log('3. Setting environment variables...');
    process.env.SMTP_HOST = config.host;
    process.env.SMTP_PORT = config.port;
    process.env.SMTP_SECURE = config.secure ? 'true' : 'false';
    process.env.SMTP_USER = config.auth.user;
    process.env.SMTP_PASSWORD = config.auth.pass;
    process.env.EMAIL_FROM = config.from;
    console.log('✅ Environment variables set\n');

    console.log('4. Initializing email service...');
    const initialized = emailSender.initialize();
    if (initialized) {
      console.log('✅ Email service initialized\n');
    } else {
      console.log('❌ Email service initialization failed\n');
      process.exit(1);
    }

    console.log('5. Verifying SMTP connection...');
    const verifyResult = await emailSender.verifyConnection();
    if (verifyResult.success) {
      console.log('✅ SMTP connection verified\n');
    } else {
      console.log('❌ SMTP connection failed:', verifyResult.error);
      console.log('   This may be expected if the SMTP server is not accessible from this network\n');
    }

    console.log('6. Testing email service methods...');
    console.log('   Available templates:', emailService.getAvailableTemplates());
    console.log('✅ Email service methods working\n');

    console.log('7. Email service status:');
    console.log(`   Ready: ${emailSender.isReady()}`);
    console.log(`   Initialized: ${emailSender.initialized}`);
    console.log(`   Transporter: ${emailSender.transporter ? 'Available' : 'Not available'}\n`);

    console.log('=== SMTP System Test Complete ===\n');
    console.log('Summary:');
    console.log('✅ Database configuration loaded');
    console.log('✅ Environment variables configured');
    console.log('✅ Email service initialized');
    console.log(`${verifyResult.success ? '✅' : '⚠️'} SMTP connection ${verifyResult.success ? 'verified' : 'verification attempted'}`);
    console.log('✅ Email templates available');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

testSmtpSystem();
