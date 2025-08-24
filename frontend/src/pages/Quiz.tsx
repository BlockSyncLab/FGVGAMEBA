import React, { useState, useEffect } from 'react';
import { Card, ProgressBar, Button, ListGroup, Badge, Alert, Form } from 'react-bootstrap';
import { useUser } from '../contexts/UserContext';
import { apiService } from '../services/api';
import type { Question } from '../services/api';

// Função para determinar o estágio do estudante
function getStage(nivel: number) {
  if (nivel === 1) return { nome: 'Aprendiz', cor: '#e6007e' };
  if (nivel <= 3) return { nome: 'Veterano', cor: '#ef7d00' };
  return { nome: 'Especialista', cor: '#95c11f' };
}





function Quiz() {
  const { user, addXP, logout } = useUser();
  
  // Estados para integração com API
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [nextHint, setNextHint] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // Estados do quiz
  const [resposta, setResposta] = useState<number|null>(null);
  const [feedback, setFeedback] = useState<string|null>(null);
  const [acertou, setAcertou] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());

  
  // Estados para o modal de próxima pergunta
  const [nextQuestionInfo, setNextQuestionInfo] = useState<any>(null);
  const [timeUntilNext, setTimeUntilNext] = useState<{hours: number, minutes: number, seconds: number}>({hours: 0, minutes: 0, seconds: 0});

  const stage = getStage(user.nivel);
  const xpTotal = user.xp_atual || user.xp;
  const xpAtual = xpTotal % 100;
  const xpParaProxNivel = 100 - xpAtual;
  const proximoNivel = user.nivel + 1;
  const proximaEtapa = getStage(proximoNivel);
  const mudouEtapa = stage.nome !== proximaEtapa.nome && acertou;

  // Carregar questões disponíveis
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        
        // Se não há usuário logado, mostrar mensagem
        if (!user || !user.login) {
          setError('Faça login para acessar os desafios.');
          setLoading(false);
          return;
        }
        
        const response = await apiService.getAvailableQuestions();
        setQuestions(response.questions);
        setNextHint(response.nextHint || '');
        
        // Selecionar a primeira questão por padrão
        if (response.questions.length > 0) {
          setSelectedQuestion(response.questions[0]);
        }
      } catch (err: any) {
        if (err.message && err.message.includes('Sessão expirada')) {
          setError('Sua sessão expirou. Redirecionando para o login...');
          // Fazer logout e redirecionar para home após 2 segundos
          setTimeout(() => {
            logout();
            window.location.href = '/';
          }, 2000);
        } else {
          setError('Erro ao carregar questões. Tente novamente.');
        }
        console.error('Erro ao carregar questões:', err);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [user]);



  // Carregar informações da próxima pergunta
  useEffect(() => {
    const loadNextQuestionInfo = async () => {
      try {
        if (!user || !user.login) return;
        
        const response = await apiService.getNextQuestionInfo();
        if (response.success && response.hasNextQuestion && response.timeUntilNext) {
          setNextQuestionInfo(response);
          setTimeUntilNext({
            hours: response.timeUntilNext.hours,
            minutes: response.timeUntilNext.minutes,
            seconds: response.timeUntilNext.totalSeconds % 60
          });
        }
      } catch (err) {
        console.error('Erro ao carregar informações da próxima pergunta:', err);
      }
    };

    loadNextQuestionInfo();
  }, [user]);

  // Timer para atualizar o tempo restante
  useEffect(() => {
    if (!nextQuestionInfo || !nextQuestionInfo.hasNextQuestion) return;

    const timer = setInterval(() => {
      setTimeUntilNext(prev => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              // Tempo esgotou, recarregar informações
              loadNextQuestionInfo();
              return { hours: 0, minutes: 0, seconds: 0 };
            }
          }
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [nextQuestionInfo]);

  const loadNextQuestionInfo = async () => {
    try {
      if (!user || !user.login) return;
      
      const response = await apiService.getNextQuestionInfo();
      if (response.success && response.hasNextQuestion && response.timeUntilNext) {
        setNextQuestionInfo(response);
        setTimeUntilNext({
          hours: response.timeUntilNext.hours,
          minutes: response.timeUntilNext.minutes,
          seconds: response.timeUntilNext.totalSeconds % 60
        });
      }
    } catch (err) {
      console.error('Erro ao carregar informações da próxima pergunta:', err);
    }
  };

  // Função para responder questão
  const responder = async () => {
    if (!selectedQuestion || resposta === null) return;

    try {
      setSubmitting(true);
      const response = await apiService.answerQuestion(selectedQuestion.id, resposta);
      
      if (response.success) {
        if (response.isCorrect) {
          // Construir mensagem de acerto com dica da próxima pergunta
          let feedbackMessage = `Correto! Você ganhou ${response.xpGained} XP! ${response.message}`;
          
          // Adicionar dica da próxima pergunta se disponível
          if (response.nextHint) {
            feedbackMessage += `\n\n💡 Dica da próxima pergunta: ${response.nextHint}`;
            setNextHint(response.nextHint);
          }
          
          setFeedback(feedbackMessage);
          addXP(response.xpGained);
          setAcertou(true);
          setAnsweredQuestions(prev => new Set([...prev, selectedQuestion.id]));
          
          // Mostrar aviso se a resposta foi atrasada
          if (response.isAtrasada) {
            setTimeout(() => {
              setFeedback(prev => prev + ' ⏰ (Resposta atrasada: -5 XP)');
            }, 2000);
          }
          
          // Recarregar questões para remover a que foi respondida
          const updatedQuestions = await apiService.getAvailableQuestions();
          setQuestions(updatedQuestions.questions);
          
          // Selecionar a primeira questão disponível
          if (updatedQuestions.questions.length > 0) {
            setSelectedQuestion(updatedQuestions.questions[0]);
          } else {
            setSelectedQuestion(null);
          }
        } else {
          setFeedback(`Ops! Resposta incorreta. ${response.message}`);
          addXP(response.xpGained); // Pode ser negativo (-10)
          setAcertou(false);
        }
      } else {
        setFeedback('Erro ao processar resposta. Tente novamente.');
      }
    } catch (err) {
      setFeedback('Erro ao enviar resposta. Tente novamente.');
      console.error('Erro ao responder:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Função para selecionar questão
  const handleQuestionSelect = (question: Question) => {
    setSelectedQuestion(question);
    setResposta(null);
    setFeedback(null);
    setAcertou(answeredQuestions.has(question.id));
    setSubmitting(false);
    setNextHint('');
  };



  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
        <p className="mt-3">Carregando questões...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-3">
        <Alert.Heading>Erro</Alert.Heading>
        <p>{error}</p>
        <Button variant="outline-danger" onClick={() => window.location.reload()}>
          Tentar Novamente
        </Button>
      </Alert>
    );
  }

  return (
    <>
      {/* Quiz */}
      <Card className="gamified-card">
        <Card.Body>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ flex: '0 0 auto', textAlign: 'center', marginBottom: '1rem' }}>
              {/* Avatar temporário: círculo colorido */}
              <div style={{ 
                width: 90, 
                height: 90, 
                borderRadius: '50%', 
                background: stage.cor, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#fff', 
                fontWeight: 700, 
                fontSize: 44, 
                border: '3px solid #95c11f', 
                margin: '0 auto',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              }}>
                {stage.nome[0]}
              </div>
              <div className="mt-2">
                <Badge className="gamified-badge">{stage.nome}</Badge>
              </div>
              <div style={{ fontSize: 12, color: '#888' }}>Nível {user.nivel}</div>
              {mudouEtapa && (
                <Alert variant="info" className="mt-2 p-2" style={{ fontWeight: 600, fontSize: 15 }}>
                  Você avançou para a etapa <b>{proximaEtapa.nome}</b>!
                </Alert>
              )}
            </div>
            <div style={{ flex: '1', minWidth: '250px' }}>
              <div className="mb-2 text-center-mobile">
                <b>XP:</b> {xpTotal} <span style={{ fontSize: 12, color: '#888' }}>(+{xpParaProxNivel} para o próximo nível)</span>
                <ProgressBar now={xpAtual} max={100} label={`${xpAtual} XP`} className="mt-2" />
              </div>
              <div style={{ fontSize: 13, color: '#555' }} className="text-center-mobile">
                <b>Etapas de Level:</b> Aprendiz (1), Veterano (2-3), Especialista (4+)
              </div>
            </div>
          </div>

          {/* Seletor de Questão */}
          <Card className="mb-4 gamified-card" style={{ background: '#f8f9fa' }}>
            <Card.Body>
              {questions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ fontSize: 48, marginBottom: 20 }}>🎉</div>
                  <Card.Title style={{ fontWeight: 700, fontSize: 24, color: '#ef7d00', marginBottom: 15 }}>
                    Parabéns! Você já completou todas as atividades!
                  </Card.Title>
                  <Card.Text style={{ fontSize: 16, color: '#666', marginBottom: 20 }}>
                    Você respondeu todas as questões disponíveis para hoje. Continue praticando amanhã!
                  </Card.Text>
                  {nextHint && (
                    <Alert variant="info" style={{ maxWidth: 600, margin: '0 auto' }}>
                      <Alert.Heading>💡 Dica da Atividade de Amanhã</Alert.Heading>
                      <p style={{ marginBottom: 0 }}>{nextHint}</p>
                    </Alert>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: '1', minWidth: '300px', marginBottom: '1rem' }}>
                    <Card.Title style={{ fontWeight: 700, fontSize: 20, color: '#ef7d00', marginBottom: 10 }} className="text-center-mobile">
                      📚 Selecione o Desafio
                    </Card.Title>
                    <Form.Select 
                      value={selectedQuestion?.id || ''} 
                      onChange={(e) => {
                        const question = questions.find(q => q.id === parseInt(e.target.value));
                        if (question) {
                          handleQuestionSelect(question);
                        }
                      }}
                      style={{ maxWidth: 300 }}
                      className="mx-auto d-block"
                    >
                      <option value="">Selecione uma questão...</option>
                      {questions.map((question, index) => (
                        <option key={question.id} value={question.id}>
                          Dia {question.day || index + 1} {answeredQuestions.has(question.id) ? '✓' : ''}
                        </option>
                      ))}
                    </Form.Select>
                  </div>
                  <div style={{ flex: '1', minWidth: '250px' }}>
                    <div style={{ 
                      background: 'rgba(149, 193, 31, 0.1)', 
                      padding: '12px', 
                      borderRadius: '8px',
                      border: '2px solid rgba(149, 193, 31, 0.3)'
                    }}>
                      <div style={{ fontWeight: 600, color: '#95c11f', marginBottom: 5 }}>
                        📖 Questão do Dia
                      </div>
                      <div style={{ fontSize: 12, color: '#666' }}>
                        {selectedQuestion ? `Questão ${questions.findIndex(q => q.id === selectedQuestion.id) + 1} de ${questions.length}` : 'Selecione uma questão'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          {selectedQuestion && questions.length > 0 && (
            <>
              <Card.Title className="mb-4 text-center-mobile" style={{ fontWeight: 700, fontSize: 28, color: '#ef7d00' }}>
                Quiz
              </Card.Title>
              
              <Card.Text style={{ fontSize: 18, fontWeight: 500 }} className="text-center-mobile">
                <b>Pergunta:</b> {selectedQuestion.pergunta}
              </Card.Text>

              {selectedQuestion.dica && (
                <Card.Text style={{ fontSize: 16, fontWeight: 400, color: '#666', fontStyle: 'italic' }} className="text-center-mobile mb-3">
                  💡 <b>Dica:</b> {selectedQuestion.dica}
                </Card.Text>
              )}

              {selectedQuestion.imagem && (
                <div className="text-center mb-3">
                  <img 
                    src={selectedQuestion.imagem} 
                    alt="Questão" 
                    style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }}
                  />
                </div>
              )}

              {answeredQuestions.has(selectedQuestion.id) && (
                <Alert variant="success" className="mb-3" style={{ fontWeight: 600, fontSize: 18 }}>
                  Parabéns! Você já acertou essa pergunta. Continue explorando outros desafios!
                </Alert>
              )}

              <ListGroup className="mb-3">
                {[selectedQuestion.a1, selectedQuestion.a2, selectedQuestion.a3, selectedQuestion.a4, selectedQuestion.a5].map((op, idx) => (
                  <React.Fragment key={idx}>
                    <ListGroup.Item
                      action
                      active={false}
                      onClick={() => !answeredQuestions.has(selectedQuestion.id) && setResposta(idx)}
                      disabled={answeredQuestions.has(selectedQuestion.id)}
                      className={resposta === idx ? 'quiz-alternative-selected' : 'quiz-alternative-default'}
                      style={{ 
                        fontSize: 17, 
                        borderRadius: 10, 
                        marginBottom: 6, 
                        opacity: answeredQuestions.has(selectedQuestion.id) ? 0.7 : 1,
                        cursor: answeredQuestions.has(selectedQuestion.id) ? 'default' : 'pointer'
                      }}
                    >
                      {op}
                      {answeredQuestions.has(selectedQuestion.id) && resposta === idx && (
                        <Badge bg="success" className="ms-2">✓ Sua Resposta</Badge>
                      )}
                    </ListGroup.Item>
                  </React.Fragment>
                ))}
              </ListGroup>

              <div className="text-center-mobile">
                <Button 
                  variant="success" 
                  className="gamified-btn" 
                  onClick={responder} 
                  disabled={resposta === null || answeredQuestions.has(selectedQuestion.id) || submitting}
                >
                  {submitting ? 'Enviando...' : answeredQuestions.has(selectedQuestion.id) ? 'Questão Respondida' : 'Responder'}
                </Button>
              </div>

              {feedback && (
                <Card.Text className="mt-3" style={{ fontWeight: 600, color: feedback.startsWith('Correto') ? '#95c11f' : '#d32f2f' }}>
                  {feedback}
                </Card.Text>
              )}

              {nextHint && (
                <Alert variant="info" className="mt-3">
                  <Alert.Heading>💡 Dica da Próxima Questão</Alert.Heading>
                  <p>{nextHint}</p>
                </Alert>
              )}

                        <Card.Text className="mt-3 text-muted" style={{ fontSize: 14 }}>
            "Cada acerto é um passo na trilha dos grandes mestres da Bahia!"
          </Card.Text>
        </>
      )}
    </Card.Body>
  </Card>


</>
);
}

export default Quiz; 