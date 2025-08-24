const { 
  getCampanhaConfig, 
  updateCampanhaConfig,
  testConnection,
  db
} = require('./database/firebase');

console.log('🔧 Restaurando configuração da campanha com variáveis importantes...');

async function restoreCampaignConfig() {
  try {
    // Testar conexão
    console.log('🔌 Testando conexão com Firebase...');
    await testConnection();
    
    // Buscar configuração atual
    console.log('📊 Verificando configuração atual...');
    const campanhaConfig = await getCampanhaConfig();
    
    if (!campanhaConfig || Object.keys(campanhaConfig).length === 0) {
      console.log('⚠️ Nenhuma configuração de campanha encontrada, criando nova...');
      
      const newConfig = {
        id: 1,
        data_inicio: new Date().toISOString().split('T')[0], // Data atual
        duracao_dias: 10, // Agora são 10 dias úteis
        ativa: true,
        current_day: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      };
      
      await updateCampanhaConfig(newConfig);
      console.log('✅ Nova configuração de campanha criada com todas as variáveis importantes');
      console.log('📋 Variáveis incluídas:', Object.keys(newConfig));
      
         } else {
       console.log('📋 Configuração atual encontrada:', campanhaConfig);
       
               // Verificar se a configuração é um objeto direto ou tem chaves
        let config, configKey;
        
        if (campanhaConfig && typeof campanhaConfig === 'object' && campanhaConfig.duracao_dias === undefined) {
          // É um objeto com chaves (ex: { "key1": { ... } })
          configKey = Object.keys(campanhaConfig)[0];
          config = campanhaConfig[configKey];
        } else {
          // É um objeto direto (ex: { duracao_dias: 10 })
          config = campanhaConfig;
          configKey = 'default';
        }
       
       console.log('🔍 Verificando variáveis existentes...');
       console.log('🔑 Chave da configuração:', configKey);
       console.log('📋 Configuração encontrada:', config);
       
       // Lista de variáveis importantes que devem existir
       const requiredVariables = {
         id: config.id || 1,
         data_inicio: config.data_inicio || new Date().toISOString().split('T')[0],
         duracao_dias: 10, // Sempre 10 agora
         ativa: config.ativa !== undefined ? config.ativa : true,
         current_day: config.current_day || 1,
         created_at: config.created_at || new Date().toISOString(),
         updated_at: new Date().toISOString(),
         last_updated: new Date().toISOString()
       };
      
      console.log('📋 Variáveis que devem existir:', Object.keys(requiredVariables));
      console.log('📋 Variáveis atualmente existentes:', Object.keys(config));
      
      // Identificar variáveis faltantes
      const missingVariables = {};
      for (const [key, value] of Object.entries(requiredVariables)) {
        if (!(key in config)) {
          missingVariables[key] = value;
          console.log(`⚠️ Variável faltando: ${key} = ${value}`);
        }
      }
      
             if (Object.keys(missingVariables).length > 0) {
         console.log('🔧 Restaurando variáveis faltantes...');
         
         if (configKey === 'default') {
           // Se é configuração direta, substituir completamente
           console.log('🔄 Substituindo configuração direta por estrutura completa...');
           await db.ref('campanha_config').set(missingVariables);
         } else {
           // Atualizar apenas as variáveis faltantes, preservando as existentes
           await db.ref(`campanha_config/${configKey}`).update(missingVariables);
         }
         
         console.log('✅ Variáveis faltantes restauradas!');
         console.log('📋 Variáveis restauradas:', Object.keys(missingVariables));
       } else {
         console.log('✅ Todas as variáveis importantes já existem!');
       }
       
       // Atualizar duracao_dias para 10 (requisito da migração)
       if (config.duracao_dias !== 10) {
         console.log('🔄 Atualizando duração para 10 dias úteis...');
         if (configKey === 'default') {
           await db.ref('campanha_config').update({
             duracao_dias: 10,
             updated_at: new Date().toISOString()
           });
         } else {
           await db.ref(`campanha_config/${configKey}`).update({
             duracao_dias: 10,
             updated_at: new Date().toISOString()
           });
         }
         console.log('✅ Duração atualizada para 10 dias úteis');
       }
      
             // Verificar configuração final
       console.log('\n🔍 Verificando configuração final...');
       const finalConfig = await getCampanhaConfig();
       
       let finalConfigData;
       if (finalConfig && typeof finalConfig === 'object' && !finalConfig.duracao_dias) {
         // É um objeto com chaves
         const finalConfigKey = Object.keys(finalConfig)[0];
         finalConfigData = finalConfig[finalConfigKey];
       } else {
         // É um objeto direto
         finalConfigData = finalConfig;
       }
       
       console.log('📋 Configuração final:');
       console.log(`  - ID: ${finalConfigData.id}`);
       console.log(`  - Data início: ${finalConfigData.data_inicio}`);
       console.log(`  - Duração: ${finalConfigData.duracao_dias} dias`);
       console.log(`  - Dia atual: ${finalConfigData.current_day}`);
       console.log(`  - Ativa: ${finalConfigData.ativa}`);
       console.log(`  - Criada em: ${finalConfigData.created_at}`);
       console.log(`  - Atualizada em: ${finalConfigData.updated_at}`);
       console.log(`  - Última atualização: ${finalConfigData.last_updated}`);
      
      console.log('\n✅ Configuração da campanha restaurada com sucesso!');
      console.log('🚀 Todas as variáveis importantes estão presentes');
    }
    
  } catch (error) {
    console.error('❌ Erro ao restaurar configuração:', error);
    process.exit(1);
  }
}

// Executar restauração
restoreCampaignConfig()
  .then(() => {
    console.log('✅ Script de restauração finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro no script de restauração:', error);
    process.exit(1);
  });
