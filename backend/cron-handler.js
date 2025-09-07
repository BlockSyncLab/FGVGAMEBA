const { startAutoAdvanceCampaign } = require('./auto-advance-campaign');

exports.handler = async (event, context) => {
  try {
    console.log('🕐 Executando cron job de atualização de campanhas...');
    
    // Executar a atualização automática de campanhas
    await startAutoAdvanceCampaign();
    
    console.log('✅ Cron job executado com sucesso');
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Cron job executado com sucesso',
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('❌ Erro no cron job:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Erro ao executar cron job',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};

