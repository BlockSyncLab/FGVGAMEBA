const { getQuestions, createUser } = require('./database/firebase');

async function addNewQuestions() {
  try {
    console.log('📝 Adicionando novas questões...');

    // Buscar questões existentes
    const existingQuestions = await getQuestions();
    const nextQuestionId = Object.keys(existingQuestions || {}).length + 1;

    console.log(`📊 Próximo ID de questão: ${nextQuestionId}`);

    // Novas questões (adicione aqui quando precisar)
    const newQuestions = [
      {
        id: nextQuestionId,
        pergunta: "Qual é a capital do Brasil?",
        dica: "É uma cidade planejada no centro do país",
        a1: "Brasília",
        a2: "São Paulo",
        a3: "Rio de Janeiro",
        a4: "Salvador",
        a5: "Belo Horizonte",
        ac: 1
      },
      {
        id: nextQuestionId + 1,
        pergunta: "Quantos estados tem o Brasil?",
        dica: "Incluindo o Distrito Federal",
        a1: "26",
        a2: "27",
        a3: "25",
        a4: "28",
        a5: "24",
        ac: 2
      },
      {
        id: nextQuestionId + 2,
        pergunta: "Qual é o maior estado do Brasil em território?",
        dica: "Fica na região Norte",
        a1: "Amazonas",
        a2: "Pará",
        a3: "Mato Grosso",
        a4: "Minas Gerais",
        a5: "Bahia",
        ac: 1
      }
    ];

    // Adicionar questões ao Firebase
    const { db } = require('./database/firebase');
    
    for (const question of newQuestions) {
      await db.ref(`perguntas/${question.id}`).set(question);
      console.log(`✅ Questão ${question.id} criada: ${question.pergunta}`);
    }

    console.log('\n🎉 Todas as novas questões foram criadas com sucesso!');
    console.log('📊 Resumo:');
    console.log(`  - ${newQuestions.length} questões criadas`);
    console.log(`  - IDs: ${newQuestions.map(q => q.id).join(', ')}`);

  } catch (error) {
    console.error('❌ Erro ao criar questões:', error);
  }
}

// Função para listar todas as questões
async function listAllQuestions() {
  try {
    console.log('📋 Listando todas as questões...');
    
    const questions = await getQuestions();
    const questionsArray = Object.values(questions || {});
    
    console.log(`📊 Total de questões: ${questionsArray.length}`);
    
    questionsArray.forEach((question, index) => {
      console.log(`\n${index + 1}. Questão ID ${question.id}:`);
      console.log(`   Pergunta: ${question.pergunta}`);
      console.log(`   Dica: ${question.dica}`);
      console.log(`   Alternativas: ${question.a1}, ${question.a2}, ${question.a3}, ${question.a4}, ${question.a5}`);
      console.log(`   Resposta correta: ${question.ac}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao listar questões:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'list') {
    listAllQuestions();
  } else {
    addNewQuestions();
  }
}

module.exports = { addNewQuestions, listAllQuestions }; 