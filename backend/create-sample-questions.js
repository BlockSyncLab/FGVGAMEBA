const { getQuestions, updateCampanhaConfig } = require('./database/firebase');

async function createSampleQuestions() {
  try {
    console.log('📝 Criando questões de exemplo...');

    // Configurar campanha para começar hoje
    const today = new Date();
    const campaignConfig = {
      data_inicio: today.toISOString(),
      duracao_dias: 4,
      ativa: true
    };

    await updateCampanhaConfig(campaignConfig);
    console.log('✅ Configuração da campanha atualizada');

    // Questões de exemplo
    const sampleQuestions = {
      1: {
        id: 1,
        pergunta: "Qual é a capital da Bahia?",
        dica: "É uma cidade histórica conhecida como 'Roma Negra'",
        a1: "Salvador",
        a2: "Feira de Santana",
        a3: "Vitória da Conquista",
        a4: "Ilhéus",
        a5: "Camaçari",
        ac: 1
      },
      2: {
        id: 2,
        pergunta: "Qual é o principal porto da Bahia?",
        dica: "Fica na região metropolitana de Salvador",
        a1: "Porto de Salvador",
        a2: "Porto de Aratu",
        a3: "Porto de Ilhéus",
        a4: "Porto de Vitória",
        a5: "Porto de Camaçari",
        ac: 2
      },
      3: {
        id: 3,
        pergunta: "Qual é o maior rio da Bahia?",
        dica: "É um dos principais rios do Nordeste brasileiro",
        a1: "Rio São Francisco",
        a2: "Rio Paraguaçu",
        a3: "Rio Jequitinhonha",
        a4: "Rio Contas",
        a5: "Rio de Ondas",
        ac: 1
      },
      4: {
        id: 4,
        pergunta: "Qual é a principal universidade federal da Bahia?",
        dica: "É uma das mais antigas universidades do Brasil",
        a1: "UFBA",
        a2: "UFRB",
        a3: "UNEB",
        a4: "UESC",
        a5: "UEFS",
        ac: 1
      },
      5: {
        id: 5,
        pergunta: "Qual é o principal produto agrícola da Bahia?",
        dica: "É muito usado na culinária brasileira",
        a1: "Cacau",
        a2: "Café",
        a3: "Soja",
        a4: "Milho",
        a5: "Feijão",
        ac: 1
      }
    };

    // Adicionar questões ao Firebase
    const { db } = require('./database/firebase');
    
    for (const [id, question] of Object.entries(sampleQuestions)) {
      await db.ref(`perguntas/${id}`).set(question);
      console.log(`✅ Questão ${id} criada: ${question.pergunta}`);
    }

    console.log('\n🎉 Todas as questões foram criadas com sucesso!');
    console.log('📊 Resumo:');
    console.log('  - 5 questões criadas');
    console.log('  - Configuração da campanha atualizada');
    console.log('  - Campanha inicia hoje');

  } catch (error) {
    console.error('❌ Erro ao criar questões:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createSampleQuestions();
}

module.exports = { createSampleQuestions }; 