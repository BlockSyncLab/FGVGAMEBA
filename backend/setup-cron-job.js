const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

async function setupCronJob() {
  try {
    console.log('⏰ Configurando cron job para avanço automático da campanha...');
    
    // Caminho absoluto do script
    const scriptPath = path.resolve(__dirname, 'auto-advance-campaign.js');
    const nodePath = process.execPath;
    
    console.log(`📁 Script: ${scriptPath}`);
    console.log(`📁 Node: ${nodePath}`);
    
    // Comando para executar o script
    const command = `${nodePath} ${scriptPath}`;
    
    // Criar arquivo de cron job
    const cronJob = `# Avançar campanha EDURATS automaticamente à meia-noite
0 0 * * * cd ${path.dirname(scriptPath)} && ${command} >> campaign-auto-advance.log 2>&1
`;
    
    // Salvar arquivo de cron
    const cronFile = path.join(__dirname, 'cron-job.txt');
    fs.writeFileSync(cronFile, cronJob);
    
    console.log('✅ Arquivo de cron job criado!');
    console.log(`📄 Arquivo: ${cronFile}`);
    console.log('\n📋 Conteúdo do cron job:');
    console.log(cronJob);
    
    console.log('\n🔧 Para instalar o cron job:');
    console.log('1. Abra o terminal como administrador');
    console.log('2. Execute: crontab -e');
    console.log('3. Adicione a linha:');
    console.log(`   0 0 * * * cd ${path.dirname(scriptPath)} && ${command} >> campaign-auto-advance.log 2>&1`);
    console.log('4. Salve e saia (Ctrl+X, Y, Enter)');
    
    console.log('\n💡 Alternativas:');
    console.log('1. Usar PM2 para manter o script rodando:');
    console.log('   npm install -g pm2');
    console.log('   pm2 start auto-advance-campaign.js --name campaign-auto-advance');
    console.log('   pm2 startup');
    console.log('   pm2 save');
    
    console.log('\n2. Usar Windows Task Scheduler (Windows):');
    console.log('   - Abrir "Agendador de Tarefas"');
    console.log('   - Criar nova tarefa');
    console.log('   - Programar para executar diariamente à 00:00');
    console.log(`   - Ação: ${nodePath} ${scriptPath}`);
    
    console.log('\n3. Usar o script em modo contínuo:');
    console.log('   node auto-advance-campaign.js start');
    
  } catch (error) {
    console.error('❌ Erro ao configurar cron job:', error);
  }
}

// Função para testar o script
async function testAutoAdvance() {
  try {
    console.log('🧪 Testando avanço automático...');
    
    const { autoAdvanceCampaign } = require('./auto-advance-campaign.js');
    await autoAdvanceCampaign();
    
    console.log('✅ Teste concluído!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'test') {
    testAutoAdvance();
  } else {
    setupCronJob();
  }
}

module.exports = { setupCronJob, testAutoAdvance }; 