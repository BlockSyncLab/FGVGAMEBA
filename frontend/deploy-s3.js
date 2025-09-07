const { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { CloudFrontClient, CreateInvalidationCommand } = require('@aws-sdk/client-cloudfront');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

// Configuração
const BUCKET_NAME = 'ga-quiz-frontend';
const CLOUDFRONT_DISTRIBUTION_ID = 'YOUR_DISTRIBUTION_ID'; // Você precisará criar uma distribuição CloudFront
const REGION = 'us-east-2';

const s3Client = new S3Client({ region: REGION });
const cloudfrontClient = new CloudFrontClient({ region: REGION });

async function uploadFile(filePath, key) {
  const fileContent = fs.readFileSync(filePath);
  const contentType = mime.lookup(filePath) || 'application/octet-stream';
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileContent,
    ContentType: contentType,
    CacheControl: key.endsWith('.html') ? 'no-cache' : 'public, max-age=31536000'
  });
  
  await s3Client.send(command);
  console.log(`✅ Uploaded: ${key}`);
}

async function uploadDirectory(dirPath, prefix = '') {
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const key = prefix ? `${prefix}/${file}` : file;
    
    if (fs.statSync(filePath).isDirectory()) {
      await uploadDirectory(filePath, key);
    } else {
      await uploadFile(filePath, key);
    }
  }
}

async function clearBucket() {
  console.log('🧹 Limpando bucket...');
  
  const listCommand = new ListObjectsV2Command({
    Bucket: BUCKET_NAME
  });
  
  const response = await s3Client.send(listCommand);
  
  if (response.Contents) {
    for (const object of response.Contents) {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: object.Key
      });
      await s3Client.send(deleteCommand);
      console.log(`🗑️ Deleted: ${object.Key}`);
    }
  }
}

async function invalidateCloudFront() {
  if (CLOUDFRONT_DISTRIBUTION_ID === 'YOUR_DISTRIBUTION_ID') {
    console.log('⚠️ CloudFront distribution ID não configurado, pulando invalidação');
    return;
  }
  
  console.log('🔄 Invalidando cache do CloudFront...');
  
  const command = new CreateInvalidationCommand({
    DistributionId: CLOUDFRONT_DISTRIBUTION_ID,
    InvalidationBatch: {
      CallerReference: Date.now().toString(),
      Paths: {
        Quantity: 1,
        Items: ['/*']
      }
    }
  });
  
  await cloudfrontClient.send(command);
  console.log('✅ Cache invalidado');
}

async function deploy() {
  try {
    console.log('🚀 Iniciando deploy do frontend...');
    
    // Verificar se a pasta dist existe
    const distPath = path.join(__dirname, 'dist');
    if (!fs.existsSync(distPath)) {
      console.error('❌ Pasta dist não encontrada. Execute "npm run build" primeiro.');
      process.exit(1);
    }
    
    // Limpar bucket
    await clearBucket();
    
    // Upload dos arquivos
    await uploadDirectory(distPath);
    
    // Invalidar cache do CloudFront
    await invalidateCloudFront();
    
    console.log('🎉 Deploy concluído com sucesso!');
    console.log(`🌐 URL: https://${BUCKET_NAME}.s3-website-${REGION}.amazonaws.com`);
    
  } catch (error) {
    console.error('❌ Erro no deploy:', error);
    process.exit(1);
  }
}

deploy();

