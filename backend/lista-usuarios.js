const { getUsers } = require('./database/firebase');

async function listaUsuarios() {
  try {
    console.log('📋 Lista completa de usuários:');
    console.log('='.repeat(100));
    
    const users = await getUsers();
    const usersArray = Object.values(users || {});
    
    console.log(`Total de usuários: ${usersArray.length}\n`);
    
    usersArray.forEach((user, index) => {
      // Calcular questões respondidas
      const questoesRespondidas = [];
      if (user.response_q1) questoesRespondidas.push('Q1');
      if (user.response_q2) questoesRespondidas.push('Q2');
      if (user.response_q3) questoesRespondidas.push('Q3');
      if (user.response_q4) questoesRespondidas.push('Q4');
      
      const nivel = Math.floor((user.xp_atual || 0) / 50) + 1;
      
      console.log(`${index + 1}. ${user.login}`);
      console.log(`   Turma: ${user.turma} - ${user.escola}`);
      console.log(`   XP: ${user.xp_atual || 0} | Nível: ${nivel}`);
      console.log(`   Questões respondidas: ${questoesRespondidas.join(', ') || 'Nenhuma'}`);
      console.log(`   Questões atribuídas: Q1=${user.id_q1 || 'N/A'}, Q2=${user.id_q2 || 'N/A'}, Q3=${user.id_q3 || 'N/A'}, Q4=${user.id_q4 || 'N/A'}`);
      console.log('');
    });
    
    // Estatísticas rápidas
    const totalXP = usersArray.reduce((sum, u) => sum + (u.xp_atual || 0), 0);
    const usuariosAtivos = usersArray.filter(u => (u.xp_atual || 0) > 0).length;
    const usuariosComQuestoes = usersArray.filter(u => 
      u.response_q1 || u.response_q2 || u.response_q3 || u.response_q4
    ).length;
    
    console.log('📊 RESUMO:');
    console.log(`- Total usuários: ${usersArray.length}`);
    console.log(`- Usuários ativos: ${usuariosAtivos}`);
    console.log(`- Usuários com questões: ${usuariosComQuestoes}`);
    console.log(`- Total XP: ${totalXP}`);
    console.log(`- Média XP: ${Math.round(totalXP / usersArray.length)}`);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

listaUsuarios();

