const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const { getQuestions, getQuestionById } = require('./database/firebase');
const admin = require('firebase-admin');

// Configuração do Google Sheets
const SPREADSHEET_ID = '1FJR2OnyJDhSiETwUgyJKG6R1teoRvBdy6LWt7Wq5YZA'; // Substitua pelo ID da sua planilha
const GOOGLE_SERVICE_ACCOUNT_EMAIL = 'sheet-import@peaceful-oath-188414.iam.gserviceaccount.com'; // Email da conta de serviço
const GOOGLE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDGTtJ5Rac/AP9K\nnLrP291u1zAjFwUhM+h+XQS8KXvjEisFMbJF2aA+Hm6G1Loo3hVP3D6Q9JzqvN9y\n/FkYGBhfywWJcb4pUSSoEiSe+8O6yQdrfDK2RQW7x36jAEkv0L4p9CjNOmDPwJs1\nrgzpKTLXTrlwSSRsJh5kSAa29YfbD+9lTgOHtjGHsIYZ3aFdq5W8f1BHd3FSLpyL\nIBpvvHV8Ma/RmjLH/Kfn0fGKWpZ0TlpWZRY6Ugv3Ng0oxVAYnkl7YnuHQsvGOHCh\nVXO0HdHVIzxc++cpHdSXPWRyRvYM+7k5kTX6VGqF2/N1WfZpgqU4BPVAtrX9hMVo\njIn6067FAgMBAAECggEAKV/hrva23cDOAtmvalXDnfActX2EjvhfDhpHNiDrnaU5\nP5SuTr+InN1Jjy0MCCHJzYc0sJawtJMihcGbrxi74SShK5uFIuawoLZkWJ1LqYlu\n2GCpzfiZqSOGyuhw3J6PRn6QEr2W3FGhsHH3dKApYN2meARyqnPLjH2wlPSmWzBa\nP8hHBwtqzMMzJkMIVOZdvP1BmbHiyPSKJWqZiyvRhAamJ+wzxUMGCQqGG+4wjfqK\nywtIwdDTYFryccqrdx6xi123i8Pkp3/CuVtqjnOx7WozUWABS+KKtMJxHmfc1qy4\nkszvEDtyv87/JwFRHkX8nuT+ZWI0bjMEV8tVsysFQwKBgQDvV03E0gOCvE5YG8Xx\nXvaVQiGfgs7YInOjE51U6VOmrXmq3bD1XdgcWs7tBwWpcGVYa6YHyso9WGpgacU1\neukdg+TIfX3+X1S2yFrXz+l7D6yQTq3mpDDTxvU4Ojf/jzWGVq72/4iicdyKCs0D\nYi4WwCYH2Pdh7XsDsSJdcX7ChwKBgQDUHF6vHNmLPymaNVuETFqxKdnDBf2PjojE\nw6ZmpPxO79Ec/a1tgO6EJ3+EtxMgXhWlVVct3l2AGGtVVhs37ghvsZh5VhKkWu11\nGM9mPrjnn8ODe68XyKgrNGgAxGuT5hNGJrIraWXnfUmeWCDc6A/gJY5NslNxv6xl\nnYvnAs67UwKBgH5A1IJNspJlWQJ7bBheWr7zip8FNq2mxs8wip7/EiRrgDHVDgLx\nBQ44DM3WFXODGcLhzkxv+e0QVdUUFnaWpp/uMmJcaHklup9M4zbSszw6UXIyPuPa\nmvMsEbEebOm/lqGN2m/q7h2a6JZdCjaNtPhFVgpvtlePGYQiDZmzRAXDAoGAeh9/\ncGk245JRPKU99NUVXm2PIFdBnzbcjhVrqCuTzUsMZhm0kZirO1GWfO3/SCKDafbR\nw+oEgW0N10tFTpVxLAXfmPSytQhZMZNATkkMoud8ZSaAMDxqfr2kp9Rvb+8G59v9\ntzru3jJngZCSEz5VbaOR5DApFRPbiYIE+9PE/VsCgYEAyPzBPdedizFhXx1Xbxri\nWrMh9gqe3aRjrtZPZxLruaA0uoOwO8a+D5Uy2d4iYlb3ehwkiu6L05AawM49vlDW\nnXjjlNNxWJvqWVYTb8vKameJ94A1DaoDw80aq9RbeBm2mClQPAhZ8BofPzl/1Vjw\n07R6FMpH/9xJ3bILXfdMiuc=\n-----END PRIVATE KEY-----\n'; // Chave privada da conta de serviço

// Obter referência do Realtime Database
const db = admin.database();

async function importQuestionsFromGoogleSheets() {
  try {
    console.log('📊 Iniciando importação de perguntas do Google Sheets...');
    
    // Configurar autenticação com escopos corretos
    const serviceAccountAuth = new JWT({
      email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: GOOGLE_PRIVATE_KEY,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file',
        'https://spreadsheets.google.com/feeds'
      ],
    });

    console.log('🔐 Autenticando com Google Sheets...');
    
    // Conectar à planilha
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
    
    console.log('📋 Carregando informações da planilha...');
    await doc.loadInfo();
    
    console.log(`📋 Planilha encontrada: ${doc.title}`);
    console.log(`📝 Total de planilhas: ${doc.sheetCount}`);
    
    // Listar todas as planilhas disponnoíveis
    console.log('📝 Planilhas disponíveis:');
    doc.sheetsByIndex.forEach((sheet, index) => {
      console.log(`  ${index + 1}. ${sheet.title}`);
    });
    
    // Acessar a planilha "Página3"
    let sheet = null;
    for (const sheetItem of doc.sheetsByIndex) {
      if (sheetItem.title === 'Página3') {
        sheet = sheetItem;
        break;
      }
    }
    
    if (!sheet) {
      console.error('❌ Planilha "Página3" não encontrada!');
      console.log('📝 Planilhas disponíveis:');
      doc.sheetsByIndex.forEach((sheetItem, index) => {
        console.log(`  ${index + 1}. ${sheetItem.title}`);
      });
      return;
    }
    
    console.log(`📝 Planilha selecionada: ${sheet.title}`);
    
    console.log('📊 Carregando células da planilha...');
    await sheet.loadCells();
    
    console.log(`📝 Planilha: ${sheet.title} (${sheet.rowCount} linhas, ${sheet.columnCount} colunas)`);
    
    // Ler dados da planilha
    const questions = [];
    
    // Assumindo que a primeira linha tem os cabeçalhos
    console.log('🔍 Lendo dados da planilha...');
    for (let rowIndex = 1; rowIndex < sheet.rowCount; rowIndex++) {
      const pergunta = sheet.getCell(rowIndex, 0).value;
      const apoio = sheet.getCell(rowIndex, 1).value;
      const a1 = sheet.getCell(rowIndex, 2).value;
      const a2 = sheet.getCell(rowIndex, 3).value;
      const a3 = sheet.getCell(rowIndex, 4).value;
      const a4 = sheet.getCell(rowIndex, 5).value;
      const a5 = sheet.getCell(rowIndex, 6).value;
      const ac = sheet.getCell(rowIndex, 7).value;
      
      console.log(`📋 Linha ${rowIndex + 1}: ${pergunta} | ${apoio} | ${a1} | ${a2} | ${a3} | ${a4} | ${a5} | ${ac}`);
      
      // Verificar se a linha tem dados válidos (pelo menos pergunta e alternativa correta)
      if (pergunta && ac) {
        questions.push({
          pergunta: pergunta.toString(),
          apoio: apoio ? apoio.toString() : '',
          a1: a1 ? a1.toString() : '',
          a2: a2 ? a2.toString() : '',
          a3: a3 ? a3.toString() : '',
          a4: a4 ? a4.toString() : '',
          a5: a5 ? a5.toString() : '',
          ac: parseInt(ac) || 1 // Converter para número, padrão 1 se inválido
        });
      }
    }
    
    console.log(`❓ Encontradas ${questions.length} perguntas na planilha`);
    
    if (questions.length === 0) {
      console.log('⚠️ Nenhuma pergunta encontrada na planilha. Verifique:');
      console.log('  1. Se a planilha tem dados');
      console.log('  2. Se a primeira linha não é cabeçalho');
      console.log('  3. Se as colunas estão na ordem correta (pergunta, apoio, a1, a2, a3, a4, a5, ac)');
      return;
    }
    
    // Buscar perguntas existentes no Firebase
    console.log('🔥 Conectando ao Firebase...');
    const existingQuestions = await getQuestions();
    const existingQuestionsArray = Object.values(existingQuestions || {});
    
    console.log(`🔥 Encontradas ${existingQuestionsArray.length} perguntas no Firebase`);
    
    // Processar cada pergunta da planilha
    let created = 0;
    let updated = 0;
    let skipped = 0;
    
    for (let i = 0; i < questions.length; i++) {
      const sheetQuestion = questions[i];
      const questionId = i + 1; // ID sequencial começando em 1
      
      // Verificar se a pergunta já existe
      const existingQuestion = existingQuestionsArray.find(q => q.id === questionId);
      
      if (existingQuestion) {
        // Atualizar pergunta existente
        console.log(`🔄 Atualizando pergunta ID ${questionId}: ${sheetQuestion.pergunta.substring(0, 50)}...`);
        
        await db.ref(`perguntas/${questionId}`).update({
          pergunta: sheetQuestion.pergunta,
          apoio: sheetQuestion.apoio,
          a1: sheetQuestion.a1,
          a2: sheetQuestion.a2,
          a3: sheetQuestion.a3,
          a4: sheetQuestion.a4,
          a5: sheetQuestion.a5,
          ac: sheetQuestion.ac,
          dica: sheetQuestion.apoio // Usar o material de apoio como dica
        });
        
        updated++;
      } else {
        // Criar nova pergunta
        console.log(`➕ Criando nova pergunta ID ${questionId}: ${sheetQuestion.pergunta.substring(0, 50)}...`);
        
        const newQuestion = {
          id: questionId,
          pergunta: sheetQuestion.pergunta,
          apoio: sheetQuestion.apoio,
          a1: sheetQuestion.a1,
          a2: sheetQuestion.a2,
          a3: sheetQuestion.a3,
          a4: sheetQuestion.a4,
          a5: sheetQuestion.a5,
          ac: sheetQuestion.ac,
          dica: sheetQuestion.apoio // Usar o material de apoio como dica
        };
        
        await db.ref(`perguntas/${questionId}`).set(newQuestion);
        
        created++;
      }
    }
    
    console.log('\n🎉 Importação de perguntas concluída!');
    console.log(`📊 Resumo:`);
    console.log(`  - Criadas: ${created} perguntas`);
    console.log(`  - Atualizadas: ${updated} perguntas`);
    console.log(`  - Ignoradas: ${skipped} linhas`);
    console.log(`  - Total processadas: ${questions.length} perguntas`);
    
  } catch (error) {
    console.error('❌ Erro na importação:', error);
    
    if (error.response) {
      console.error('📊 Detalhes do erro:');
      console.error(`  - Status: ${error.response.status}`);
      console.error(`  - Mensagem: ${error.response.statusText}`);
      
      if (error.response.status === 403) {
        console.error('\n🔧 Soluções para erro 403:');
        console.error('1. Verifique se a planilha foi compartilhada com o email da conta de serviço');
        console.error('2. Verifique se a conta de serviço tem permissão de "Editor" na planilha');
        console.error('3. Verifique se a Google Sheets API está ativada no Google Cloud Console');
        console.error('4. Verifique se as credenciais estão corretas');
      }
    }
  }
}

// Função para configurar as credenciais
function setupCredentials() {
  console.log('🔧 Configuração necessária:');
  console.log('1. Crie uma conta de serviço no Google Cloud Console');
  console.log('2. Compartilhe sua planilha com o email da conta de serviço');
  console.log('3. Configure as variáveis no início do script:');
  console.log('   - SPREADSHEET_ID: ID da sua planilha');
  console.log('   - GOOGLE_SERVICE_ACCOUNT_EMAIL: Email da conta de serviço');
  console.log('   - GOOGLE_PRIVATE_KEY: Chave privada da conta de serviço');
  console.log('');
  console.log('📋 Estrutura esperada da planilha (aba Página3):');
  console.log('  Coluna A: pergunta');
  console.log('  Coluna B: apoio');
  console.log('  Coluna C: a1');
  console.log('  Coluna D: a2');
  console.log('  Coluna E: a3');
  console.log('  Coluna F: a4');
  console.log('  Coluna G: a5');
  console.log('  Coluna H: ac (número da alternativa correta)');
}

// Executar se chamado diretamente
if (require.main === module) {
  if (SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID') {
    setupCredentials();
  } else {
    importQuestionsFromGoogleSheets();
  }
}

module.exports = { importQuestionsFromGoogleSheets, setupCredentials }; 