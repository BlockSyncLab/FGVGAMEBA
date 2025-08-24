import { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Table, Button, Alert, Modal } from 'react-bootstrap';
import { useUser } from '../contexts/UserContext';
import { apiService } from '../services/api';
import type { TurmaInfo } from '../services/api';

function Ranking() {
  const { user, logout } = useUser();
  const [estudantesTurma, setEstudantesTurma] = useState<any[]>([]);
  const [estatisticasTurma, setEstatisticasTurma] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [topTurmas, setTopTurmas] = useState<any[]>([]);
  const [turmaUsuario, setTurmaUsuario] = useState<TurmaInfo | null>(null);
  const [showRankingModal, setShowRankingModal] = useState(false);
  const [todasTurmas, setTodasTurmas] = useState<any[]>([]);
  const [loadingRankingCompleto, setLoadingRankingCompleto] = useState(false);
  const [error, setError] = useState<string>('');
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
      } catch (error: any) {
        if (error.message && error.message.includes('Sessão expirada')) {
          setError('Sua sessão expirou. Redirecionando para o login...');
          setTimeout(() => {
            logout();
            window.location.href = '/';
          }, 2000);
        } else {
          console.error('Erro ao carregar dados da turma:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    loadTurmaData();
  }, [user]);

  // Carregar dados do ranking geral
  useEffect(() => {
    const loadRankingData = async () => {
      try {
        // Só carregar dados reais se o usuário estiver logado
        if (!user || !user.login) {
          return;
        }
        
        console.log('🔄 Carregando ranking real...');
        
        const top3Response = await apiService.getTop3Classes();
        console.log('📊 Top 3 turmas:', top3Response);
        setTopTurmas(top3Response.top3 || []);
        
        // Se o usuário estiver logado, buscar posição da turma dele
        if (user && user.turma && user.escola) {
          const turmaResponse = await apiService.getClassPosition(user.turma, user.escola);
          console.log('👥 Posição da turma:', turmaResponse);
          setTurmaUsuario({
            turma: user.turma,
            escola: user.escola,
            totalEstudantes: turmaResponse.turma.totalEstudantes || 0,
            posicao: turmaResponse.turma.posicao,
            mediaXp: turmaResponse.turma.mediaXp || 0,
            mediaParticipacao: turmaResponse.turma.mediaParticipacao || 0,
            scoreGlobal: turmaResponse.turma.scoreGlobal || 0
          });
        }
      } catch (error) {
        console.error('❌ Erro ao carregar ranking:', error);
      }
    };

    loadRankingData();
  }, [user]);

  // Função para carregar ranking completo de todas as turmas
  const loadRankingCompleto = async () => {
    try {
      setLoadingRankingCompleto(true);
      
      // Buscar ranking completo de todas as turmas via API
      const response: any = await apiService.getClassRanking();
      console.log('📊 Ranking completo carregado:', response);
      
      // A API retorna diretamente um array de turmas
      if (Array.isArray(response)) {
        setTodasTurmas(response);
      } else if (response && response.ranking && Array.isArray(response.ranking)) {
        // Fallback caso a API retorne um objeto com propriedade ranking
        setTodasTurmas(response.ranking);
      } else {
        console.error('❌ API não retornou dados válidos');
        setTodasTurmas([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar ranking completo:', error);
      setTodasTurmas([]);
    } finally {
      setLoadingRankingCompleto(false);
    }
  };

  const renderTopItem = (item: any, position: number) => {
    const emojis = ['🥇', '🥈', '🥉'];
    const cores = ['#ef7d00', '#e6007e', '#95c11f'];
    
    // Calcular XP para barra de progresso (simulado)
    const xpAtual = (item.mediaXp || 0) % 50;
    const xpParaProxNivel = 50 - xpAtual;
    
    return (
                    <div key={`${item.turma}-${item.escola}-${position}`} style={{
         display: 'flex',
         alignItems: 'center',
         padding: '12px',
         marginBottom: '8px',
         borderRadius: '8px',
         background: position < 3 ? `rgba(${position === 0 ? '239,125,0' : position === 1 ? '230,0,126' : '149,193,31'},0.1)` : '#f8f9fa',
         border: position < 3 ? `2px solid ${cores[position]}` : '1px solid #dee2e6',
         minHeight: '80px',
         flexWrap: 'wrap'
       }}>
                 <div style={{
           width: 40,
           height: 40,
           borderRadius: '50%',
           background: position < 3 ? cores[position] : '#6c757d',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           color: '#fff',
           fontWeight: 700,
           fontSize: 18,
           marginRight: 12,
           flexShrink: 0
         }}>
          {position < 3 ? emojis[position] : position + 1}
        </div>
        
                 {/* XP + Score + Participação integrado */}
         <div style={{ 
           display: 'flex', 
           alignItems: 'center', 
           gap: 8,
           marginRight: 12,
           flexShrink: 0
         }}>
          {/* XP com barra de progresso */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: 2
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 4,
              fontSize: 12,
              fontWeight: 600,
              color: '#495057'
            }}>
              <span>XP: {item.mediaXp}</span>
              <Badge bg="warning" text="dark" style={{ fontSize: 8 }}>
                                 Score: {item.scoreGlobal || Math.round((item.mediaXp || 0) * (item.mediaParticipacao || 0))}
              </Badge>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 4,
              fontSize: 10,
              color: '#6c757d'
            }}>
              <div style={{ 
                width: 40, 
                height: 6, 
                background: '#e9ecef', 
                borderRadius: 3,
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${(xpAtual / 50) * 100}%`, 
                  height: '100%', 
                  background: '#ef7d00',
                  borderRadius: 3
                }} />
              </div>
              <span>+{xpParaProxNivel}</span>
            </div>
          </div>
          
          {/* Participação integrada */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            padding: '4px 8px',
            background: 'rgba(149,193,31,0.1)',
            borderRadius: '6px',
            border: '1px solid rgba(149,193,31,0.3)'
          }}>
            <div style={{ fontSize: 10, color: '#666' }}>📊</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#495057', textAlign: 'center' }}>
              {Math.round((item.mediaParticipacao || 0) * 100)}%
            </div>
            <div style={{ fontSize: 8, color: '#666', textAlign: 'center' }}>
              Part.
            </div>
          </div>
        </div>
        
                 <div style={{ flex: 1, minWidth: 0 }}>
           <div style={{ 
             fontWeight: 600, 
             fontSize: 16, 
             wordWrap: 'break-word',
             overflowWrap: 'break-word',
             hyphens: 'auto'
           }}>
             {item.turma}
           </div>
           <div style={{ 
             fontSize: 12, 
             color: '#6c757d',
             wordWrap: 'break-word',
             overflowWrap: 'break-word',
             hyphens: 'auto'
           }}>
             {item.escola}
           </div>
         </div>
      </div>
    );
  };

  // Se não há usuário logado
  if (!user || !user.login) {
    return (
      <Card className="gamified-card">
        <Card.Body>
          <Card.Title style={{ fontWeight: 700, fontSize: 24, color: '#ef7d00', textAlign: 'center', marginBottom: 20 }}>
            🔐 Acesso Restrito
          </Card.Title>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>Faça login para acessar o ranking e os dados da sua turma.</p>
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
            <p>Carregando dados do ranking...</p>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      {/* Exibir erro se houver */}
      {error && (
        <Alert variant="warning" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}
      
      {/* Ranking Geral das Turmas */}
      <Card className="mb-4 gamified-card">
        <Card.Body>
          <Card.Title style={{ fontWeight: 700, fontSize: 28, color: '#ef7d00', marginBottom: 20 }} className="text-center-mobile">
            🏆 Ranking Geral das Turmas
          </Card.Title>
          
          <div style={{ 
            background: 'rgba(149, 193, 31, 0.1)', 
            padding: '20px', 
            borderRadius: '12px',
            border: '2px solid rgba(149, 193, 31, 0.3)',
            marginBottom: 30
          }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
               <h5 style={{ color: '#95c11f', fontWeight: 600, margin: 0 }}>
                 🏆 TOP 3 Turmas - Score Global (XP × Participação)
               </h5>
               <Button 
                 variant="outline-success" 
                 size="sm"
                 onClick={() => {
                   loadRankingCompleto();
                   setShowRankingModal(true);
                 }}
                 style={{ fontSize: 12, padding: '6px 12px' }}
               >
                 📊 Ver Todas
               </Button>
             </div>
            
            {topTurmas.length > 0 ? (
              <>
                {topTurmas.map((item, index) => renderTopItem(item, index))}
                
                {turmaUsuario && turmaUsuario.posicao > 3 && (
                  <div style={{ marginTop: 15, paddingTop: 15, borderTop: '1px solid #dee2e6' }}>
                    <h6 style={{ color: '#6c757d', marginBottom: 10 }}>Sua Turma:</h6>
                    {renderTopItem(turmaUsuario, turmaUsuario.posicao - 1)}
                  </div>
                )}
              </>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '20px', 
                color: '#666',
                fontStyle: 'italic'
              }}>
                📊 Carregando ranking...
              </div>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Dados da Turma do Usuário */}
      <Card className="mb-4 gamified-card" style={{ background: 'linear-gradient(135deg, #ef7d00, #e6007e)', color: '#fff' }}>
        <Card.Body>
          <Row>
            <Col md={8}>
              <Card.Title style={{ fontWeight: 700, fontSize: 28, marginBottom: 10 }}>
                                 👥 {user.turma} - {user.escola}
              </Card.Title>
              <Card.Text style={{ fontSize: 16, opacity: 0.9 }}>
                Série: {user.serie}
              </Card.Text>
            </Col>
            <Col md={4}>
                             <div style={{ fontSize: 14, opacity: 0.9 }}>
                 <div>Total de Estudantes: {estatisticasTurma.totalEstudantes || 'N/A'}</div>
               </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row className="mb-4">
        <Col md={6} className="mb-3">
          <Card className="text-center gamified-card" style={{ background: '#f8f9fa' }}>
            <Card.Body>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#ef7d00' }}>
                {estatisticasTurma.mediaXp || 0}
              </div>
              <div style={{ fontSize: 14, color: '#666' }}>Média XP</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-3">
          <Card className="text-center gamified-card" style={{ background: '#f8f9fa' }}>
            <Card.Body>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#e6007e' }}>
                {estatisticasTurma.mediaParticipacao ? Math.round(estatisticasTurma.mediaParticipacao * 100) : 0}%
              </div>
              <div style={{ fontSize: 14, color: '#666' }}>Média Participação</div>
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
                             <div key={`${estudante.nome || 'estudante'}-${idx}`} style={{ textAlign: 'center', position: 'relative', minWidth: 100 }}>
                <div style={{
                  width: 90, height: 90, borderRadius: '50%',
                  background: coresPodio[idx], display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 32,
                  margin: '0 auto 10px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                }}>
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                </div>
                                 <div style={{ fontWeight: 600, color: '#333' }}>{estudante.nome || 'Estudante'}</div>
                                 <Badge bg="warning" text="dark" className="gamified-badge" style={{ marginTop: 5 }}>{estudante.xp || 0} XP</Badge>
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
                                       <th>XP</th>
                </tr>
              </thead>
              <tbody>
                {estudantesTurma.map((estudante, index) => (
                  <tr key={`${estudante.nome || 'estudante'}-${index}`} style={{
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
                                         <td style={{ fontWeight: 600 }}>{estudante.nome || 'Estudante'}</td>
                    <td>
                      <Badge bg="warning" text="dark">
                                                 {estudante.xp || 0} XP
                      </Badge>
                    </td>
                                         <td>Nível {estudante.nivel || 1}</td>
                                         <td>
                       <Badge bg="warning" text="dark">
                         {estudante.xp || 0} XP
                       </Badge>
                     </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
                 </Card.Body>
       </Card>

       {/* Modal com Ranking Completo de Todas as Turmas */}
               <Modal 
          show={showRankingModal} 
          onHide={() => setShowRankingModal(false)}
          size="xl"
          centered
          dialogClassName="modal-ranking-completo"
          style={{ maxWidth: '100vw', margin: '10px', height: '100vh' }}
        >
         <Modal.Header closeButton style={{ background: '#95c11f', color: '#fff' }}>
           <Modal.Title style={{ fontSize: '1.5rem', fontWeight: 700 }}>
             🏆 Ranking Completo de Todas as Turmas
           </Modal.Title>
         </Modal.Header>
                   <Modal.Body style={{ padding: 0, height: 'calc(100vh - 140px)', overflow: 'hidden', minHeight: '400px' }}>
            {loadingRankingCompleto ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p>Carregando ranking completo...</p>
              </div>
            ) : (
                             <div style={{ 
                 height: '100%', 
                 overflowY: 'auto',
                 padding: '15px',
                 minHeight: '350px'
               }}>
                 <div className="table-responsive" style={{ height: '100%', overflowX: 'auto', minHeight: '300px' }}>
                                   <Table striped bordered hover style={{ marginBottom: 0, width: '100%', minWidth: '100%' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#2c3e50', zIndex: 1 }}>
                      <tr>
                                                 <th style={{ 
                           width: '10%',
                           background: '#2c3e50',
                           borderBottom: '2px solid #34495e',
                           color: '#fff',
                           textAlign: 'center',
                           padding: '12px 8px'
                         }}>
                           Pos.
                         </th>
                         <th style={{ 
                           width: '20%',
                           background: '#2c3e50',
                           borderBottom: '2px solid #34495e',
                           color: '#fff',
                           padding: '12px 8px'
                         }}>
                           Turma
                         </th>
                         <th style={{ 
                           width: '25%',
                           background: '#2c3e50',
                           borderBottom: '2px solid #34495e',
                           color: '#fff',
                           padding: '12px 8px'
                         }}>
                           Escola
                         </th>
                         <th style={{ 
                           width: '15%',
                           background: '#2c3e50',
                           borderBottom: '2px solid #34495e',
                           color: '#fff',
                           textAlign: 'center',
                           padding: '12px 8px'
                         }}>
                           Média XP
                         </th>
                         <th style={{ 
                           width: '15%',
                           background: '#2c3e50',
                           borderBottom: '2px solid #34495e',
                           color: '#fff',
                           textAlign: 'center',
                           padding: '12px 8px'
                         }}>
                           Participação
                         </th>
                         <th style={{ 
                           width: '15%',
                           background: '#2c3e50',
                           borderBottom: '2px solid #34495e',
                           color: '#fff',
                           textAlign: 'center',
                           padding: '12px 8px'
                         }}>
                           Score Global
                         </th>
                      </tr>
                    </thead>
                   <tbody>
                     {todasTurmas.map((turma, index) => (
                                               <tr key={`${turma.turma}-${turma.escola}-${index}`} style={{
                          background: index < 3 ? 'rgba(239,125,0,0.15)' : (index % 2 === 0 ? '#f8f9fa' : '#ffffff'),
                          borderBottom: '1px solid #dee2e6'
                        }}>
                                                     <td style={{ 
                             textAlign: 'center', 
                             verticalAlign: 'middle',
                             padding: '8px 4px',
                             borderRight: '1px solid #dee2e6'
                           }}>
                             <div style={{
                               width: 30, 
                               height: 30, 
                               borderRadius: '50%',
                               background: index < 3 ? coresPodio[index] : '#6c757d',
                               display: 'flex', 
                               alignItems: 'center', 
                               justifyContent: 'center',
                               color: '#fff', 
                               fontWeight: 700, 
                               fontSize: 14,
                               margin: '0 auto',
                               boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                             }}>
                               {index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}
                             </div>
                           </td>
                                                       <td style={{ 
                              fontWeight: 600, 
                              verticalAlign: 'middle',
                              fontSize: '0.9rem',
                              padding: '8px 4px',
                              borderRight: '1px solid #dee2e6',
                              color: '#2c3e50',
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word',
                              hyphens: 'auto',
                              maxWidth: '0',
                              whiteSpace: 'normal'
                            }}>
                              {turma.turma}
                            </td>
                            <td style={{ 
                              verticalAlign: 'middle',
                              fontSize: '0.85rem',
                              padding: '8px 4px',
                              borderRight: '1px solid #dee2e6',
                              color: '#34495e',
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word',
                              hyphens: 'auto',
                              maxWidth: '0',
                              whiteSpace: 'normal'
                            }}>
                              {turma.escola}
                            </td>
                           <td style={{ 
                             textAlign: 'center', 
                             verticalAlign: 'middle',
                             padding: '8px 4px',
                             borderRight: '1px solid #dee2e6'
                           }}>
                             <Badge bg="warning" text="dark" style={{ fontSize: '0.8rem', padding: '6px 8px' }}>
                               {turma.mediaXp} XP
                             </Badge>
                           </td>
                           <td style={{ 
                             textAlign: 'center', 
                             verticalAlign: 'middle',
                             padding: '8px 4px',
                             borderRight: '1px solid #dee2e6'
                           }}>
                             <Badge bg="info" text="dark" style={{ fontSize: '0.8rem', padding: '6px 8px' }}>
                               {Math.round((turma.mediaParticipacao || 0) * 100)}%
                             </Badge>
                           </td>
                           <td style={{ 
                             textAlign: 'center', 
                             verticalAlign: 'middle',
                             padding: '8px 4px'
                           }}>
                             <Badge bg="success" text="dark" style={{ fontSize: '0.8rem', padding: '6px 8px' }}>
                               {turma.scoreGlobal || Math.round((turma.mediaXp || 0) * (turma.mediaParticipacao || 0))}
                             </Badge>
                           </td>
                        </tr>
                     ))}
                   </tbody>
                 </Table>
               </div>
             </div>
           )}
         </Modal.Body>
                   <Modal.Footer style={{ background: '#ecf0f1', borderTop: '2px solid #bdc3c7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ fontSize: '0.9rem', color: '#2c3e50', fontWeight: 600 }}>
                Total de {todasTurmas.length} turmas
              </div>
              <Button variant="primary" onClick={() => setShowRankingModal(false)}>
                Fechar
              </Button>
            </div>
          </Modal.Footer>
       </Modal>
     </>
   );
 }

export default Ranking;
