import { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Table } from 'react-bootstrap';
import { useUser } from '../contexts/UserContext';
import { apiService } from '../services/api';

function MinhaTurma() {
  const { user } = useUser();
  const [estudantesTurma, setEstudantesTurma] = useState<any[]>([]);
  const [estatisticasTurma, setEstatisticasTurma] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const coresPodio = ['#ef7d00', '#e6007e', '#95c11f'];

  // Carregar dados da turma
  useEffect(() => {
    const loadTurmaData = async () => {
      if (!user || !user.login) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiService.getClassDetails();
        setEstudantesTurma(response.estudantes || []);
        setEstatisticasTurma(response.turma || {});
      } catch (error) {
        console.error('Erro ao carregar dados da turma:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTurmaData();
  }, [user]);

  // Se não há usuário logado
  if (!user || !user.login) {
    return (
      <Card className="gamified-card">
        <Card.Body>
          <Card.Title style={{ fontWeight: 700, fontSize: 24, color: '#ef7d00', textAlign: 'center', marginBottom: 20 }}>
            🔐 Acesso Restrito
          </Card.Title>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>Faça login para acessar os dados da sua turma.</p>
            <p>Use qualquer login de "aluno001" a "aluno010" com senha "123".</p>
          </div>
        </Card.Body>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="gamified-card">
        <Card.Body>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Carregando dados da turma...</p>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-4 gamified-card" style={{ background: 'linear-gradient(135deg, #ef7d00, #e6007e)', color: '#fff' }}>
        <Card.Body>
          <Row>
            <Col md={8}>
              <Card.Title style={{ fontWeight: 700, fontSize: 28, marginBottom: 10 }}>
                👥 {estatisticasTurma.nome || user.turma} - {estatisticasTurma.escola || user.escola}
              </Card.Title>
              <Card.Text style={{ fontSize: 16, opacity: 0.9 }}>
                Série: {user.serie}
              </Card.Text>
            </Col>
            <Col md={4}>
              <div style={{ fontSize: 14, opacity: 0.9 }}>
                <div>Total de Estudantes: {estatisticasTurma.totalEstudantes || 0}</div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="text-center gamified-card" style={{ background: '#f8f9fa' }}>
            <Card.Body>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#ef7d00' }}>
                {estatisticasTurma.mediaXp || 0}
              </div>
              <div style={{ fontSize: 14, color: '#666' }}>Média XP</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="text-center gamified-card" style={{ background: '#f8f9fa' }}>
            <Card.Body>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#e6007e' }}>
                {estatisticasTurma.mediaParticipacao ? Math.round(estatisticasTurma.mediaParticipacao * 100) : 0}%
              </div>
              <div style={{ fontSize: 14, color: '#666' }}>Média Participação</div>
            </Card.Body>
          </Card>
        </Col>
                          <Col md={4} className="mb-3">
           <Card className="text-center gamified-card" style={{ background: '#f8f9fa' }}>
             <Card.Body>
               <div style={{ fontSize: 24, fontWeight: 700, color: '#95c11f' }}>
                 #{estatisticasTurma.posicaoRanking || 'N/A'}
               </div>
               <div style={{ fontSize: 14, color: '#666' }}>Posição Geral</div>
               <div style={{ fontSize: 12, color: '#888', marginTop: 5 }}>
                 Score: {estatisticasTurma.scoreGlobal || 0}
               </div>
             </Card.Body>
           </Card>
         </Col>
      </Row>

      <Card className="mb-4 gamified-card" style={{ background: 'linear-gradient(135deg, #fff8f0, #fff0f8)', border: '2px solid #ef7d00' }}>
        <Card.Body>
          <Card.Title style={{ fontWeight: 700, fontSize: 20, color: '#ef7d00', textAlign: 'center', marginBottom: 20 }}>
            🏆 Top 3 da Turma
          </Card.Title>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
            {estudantesTurma.slice(0, 3).map((estudante, idx) => (
              <div key={estudante.id} style={{ textAlign: 'center', position: 'relative', minWidth: 100 }}>
                <div style={{
                  width: 90, height: 90, borderRadius: '50%',
                  background: coresPodio[idx], display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 32,
                  margin: '0 auto 10px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                }}>
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                </div>
                <div style={{ fontWeight: 600, color: '#333' }}>{estudante.nome}</div>
                <Badge bg="warning" text="dark" className="gamified-badge" style={{ marginTop: 5 }}>{estudante.xp} XP</Badge>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      <Card className="gamified-card">
        <Card.Body>
          <Card.Title style={{ fontWeight: 700, fontSize: 20, color: '#ef7d00', marginBottom: 20 }}>
            📊 Lista Completa da Turma
          </Card.Title>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Posição</th>
                  <th>Nome</th>
                  <th>XP</th>
                  <th>Nível</th>
                  <th>Desafios Completados</th>
                </tr>
              </thead>
              <tbody>
                {estudantesTurma.map((estudante, index) => (
                  <tr key={estudante.id} style={{
                    background: index < 3 ? 'rgba(239,125,0,0.1)' : 'transparent'
                  }}>
                    <td>
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%',
                        background: index < 3 ? coresPodio[index] : '#6c757d',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: 12
                      }}>
                        {index + 1}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{estudante.nome}</td>
                    <td>
                      <Badge bg="warning" text="dark">
                        {estudante.xp} XP
                      </Badge>
                    </td>
                    <td>Nível {estudante.nivel}</td>
                    <td>{estudante.desafiosCompletados}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </>
  );
}

export default MinhaTurma; 