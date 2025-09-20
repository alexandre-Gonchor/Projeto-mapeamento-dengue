'use client'
import dynamic from 'next/dynamic';
import { useState, useEffect, useMemo, useCallback } from 'react';
import '@/app/styles/bootstrap.css'

// Componente para exibir alertas de erro/sucesso de forma limpa
const Alert = ({ message, type = 'danger', onDismiss }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 5000); // O alerta some após 5 segundos
      return () => clearTimeout(timer);
    }
  }, [message, onDismiss]);

  if (!message) return null;
  return <div className={`alert alert-${type} mt-3`}>{message}</div>;
};

export default function Home() {
  // --- Estados do Formulário ---
  const [tipo, setTipo] = useState('Água parada');
  const [descricao, setDescricao] = useState('');
  const [localizacao, setLocalizacao] = useState('');

  // --- Estados da Página e Dados ---
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [registros, setRegistros] = useState([]);
  
  // --- Estados de UI e Interação ---
  const [apiMessage, setApiMessage] = useState('');
  const [recenterRequest, setRecenterRequest] = useState(null);
  const [popupToOpenId, setPopupToOpenId] = useState(null);

  // --- Estados de Paginação e Filtro ---
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [registrosPorPagina] = useState(5);
  const [filtroStatus, setFiltroStatus] = useState('all');
  const [totalPaginas, setTotalPaginas] = useState(1); // Controlado pela API

  // Importação dinâmica do mapa para evitar erro de SSR (window is not defined)
  const MapWithNoSSR = useMemo(() => dynamic(() => import('./components/mapClient'), {
    ssr: false,
    loading: () => (
      <div className="d-flex justify-content-center align-items-center rounded" style={{ height: "400px", backgroundColor: "#e9ecef" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando mapa...</span>
        </div>
      </div>
    ),
  }), []);

  // --- FUNÇÕES DE API ---
  const buscarRegistros = useCallback(async (page) => {
    try {
      const response = await fetch(`/api/pegar_foco?page=${page}&limit=${registrosPorPagina}`);
      if (!response.ok) throw new Error('Falha ao buscar registros da API');
      
      const data = await response.json();

      setRegistros(data.data || []);
      setTotalPaginas(data.pagination?.totalPages || 1);

    } catch (err) {
      console.error("Erro ao buscar registros:", err);
      setApiMessage('Erro ao carregar os registros.');
    }
  }, [registrosPorPagina]);

  const salvarRegistro = async (event) => {
    event.preventDefault();
    setApiMessage('');
    if (!localizacao) {
      setApiMessage("Por favor, selecione uma localização clicando no mapa.");
      return;
    }

    const formData = new FormData();
    formData.append('tipo', tipo);
    formData.append('descricao', descricao);
    formData.append('localizacao', localizacao);
    formData.append('status', 'suspeito');

    try {
      const response = await fetch('/api/registrar_Foco', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Falha ao salvar registro');
      
      setApiMessage("Registro salvo com sucesso!");
      
      if (paginaAtual === 1) {
        await buscarRegistros(1);
      } else {
        setPaginaAtual(1);
      }
      
      setTipo('Água parada');
      setDescricao('');
      setLocalizacao('');
      if(document.getElementById('photo')) document.getElementById('photo').value = '';
    } catch (err) {
      console.error("Erro ao salvar registro:", err);
      setApiMessage("Houve um erro ao tentar salvar o registro.");
    }
  };

  const handleStatusChange = useCallback(async (registroId, novoStatus) => {
    setApiMessage('');
    try {
      const response = await fetch('/api/atualizar_status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: registroId, status: novoStatus }),
      });
      if (!response.ok) throw new Error('Falha ao atualizar o status.');
      
      const registroAtualizado = await response.json();
      setRegistros(prev => prev.map(r => r.id === registroId ? registroAtualizado : r));
      setApiMessage("Status atualizado com sucesso!");
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      setApiMessage("Houve um erro ao tentar atualizar o status.");
    }
  }, []);

  // --- EFEITO INICIAL E DE ATUALIZAÇÃO DE PÁGINA ---
  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
            setIsLoading(false);
          },
          () => {
            console.warn("Permissão de localização negada. Usando localização padrão.");
            setIsLoading(false);
          }
        );
      } else {
        console.warn("Geolocalização não é suportada. Usando localização padrão.");
        setIsLoading(false);
      }
    };
    
    if (isLoading) {
        getLocation();
    }
    
    buscarRegistros(paginaAtual);
  }, [paginaAtual, buscarRegistros, isLoading]);
  
  // --- HANDLERS DE INTERAÇÃO ---
  const handleMapClick = useCallback((latlng) => {
    setLocalizacao(`${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`);
  }, []);
  
  const handleRecenter = useCallback(() => {
    if (location) {
      setRecenterRequest({ ...location });
    } else {
      setApiMessage("Não foi possível obter sua localização.");
    }
  }, [location]);

  const handleRegistroClick = useCallback((registro) => {
    if (registro.localizacao) {
      const coordsArray = registro.localizacao.split(',').map(coord => parseFloat(coord.trim()));
      if (coordsArray.length === 2 && !isNaN(coordsArray[0]) && !isNaN(coordsArray[1])) {
        setRecenterRequest({ latitude: coordsArray[0], longitude: coordsArray[1] });
        setPopupToOpenId(registro.id);
      }
    }
  }, []);

  // --- LÓGICA DE FILTRO E PAGINAÇÃO ---
  const registrosFiltrados = useMemo(() => {
    if (!Array.isArray(registros)) return []; // Medida de segurança
    if (filtroStatus === 'all') return registros;
    return registros.filter(r => r.status === filtroStatus);
  }, [registros, filtroStatus]);

  const registrosAtuais = registrosFiltrados;

  const irParaPagina = (num) => setPaginaAtual(num);
  const proximaPagina = () => setPaginaAtual(curr => Math.min(curr + 1, totalPaginas));
  const paginaAnterior = () => setPaginaAtual(curr => Math.max(curr - 1, 1));
  
  const mapCenter = useMemo(() => location ? [location.latitude, location.longitude] : [-25.4284, -49.2733], [location]);

  // --- RENDERIZAÇÃO ---
  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Mapeamento de Focos de Dengue</h3>
      </div>
      <div className="row g-3">
        <div className="col-md-8">
          {isLoading ? (
            <div className="d-flex justify-content-center align-items-center rounded" style={{ height: "400px", backgroundColor: "#e9ecef" }}>
              <div className="text-center">
                <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
                <p className="mt-2">Obtendo sua localização...</p>
              </div>
            </div>
          ) : (
            <MapWithNoSSR
              center={mapCenter}
              zoom={15}
              registros={registrosFiltrados}
              onMapClick={handleMapClick}
              recenter={recenterRequest}
              openPopupId={popupToOpenId}
              onStatusChange={handleStatusChange}
            />
          )}
          <div className="d-flex justify-content-between align-items-center mt-1">
            <small className="text-muted">Clique no mapa para preencher a localização.</small>
            <button className="btn btn-outline-primary btn-sm" onClick={handleRecenter} disabled={!location}>
              📍 Ir para minha localização
            </button>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Registrar possível foco</h5>
              <form onSubmit={salvarRegistro}>
                <div className="mb-2"><label className="form-label">Tipo</label><select className="form-select" required value={tipo} onChange={(e) => setTipo(e.target.value)}><option value="Água parada">Água parada</option><option value="Lixo">Lixo</option><option value="Pneu">Pneu</option><option value="Caixa d'água destampada">Caixa d'água destampada</option><option value="Outro">Outro</option></select></div>
                <div className="mb-2"><label className="form-label">Descrição</label><textarea className="form-control" rows="2" value={descricao} onChange={(e) => setDescricao(e.target.value)}></textarea></div>
                <div className="mb-2"><label className="form-label">Localização (lat, lng)</label><input className="form-control form-control-sm" readOnly placeholder="Clique no mapa para selecionar" value={localizacao} /></div>
                <div className="d-grid gap-2"><button type="submit" className="btn btn-primary">Salvar registro</button></div>
              </form>
              <Alert message={apiMessage} type={apiMessage.includes('Erro') ? 'danger' : 'success'} onDismiss={() => setApiMessage('')} />
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <h6 className="card-title">Registros Recentes</h6>
              <select className="form-select form-select-sm mb-2" value={filtroStatus} onChange={(e) => { setFiltroStatus(e.target.value); }}><option value="all">Todos</option><option value="suspeito">Suspeito</option><option value="confirmado">Confirmado</option><option value="resolvido">Resolvido</option></select>
              <div className="list-group mb-3">
                {registrosAtuais.length > 0 ? (
                  registrosAtuais.map(r => (
                    <div key={r.id} className="list-group-item list-group-item-action" onClick={() => handleRegistroClick(r)} style={{ cursor: 'pointer' }}>
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">📌 {r.tipo}</h6><small className={`badge bg-${r.status === 'resolvido' ? 'success' : (r.status === 'confirmado' ? 'danger' : 'warning')}`}>{r.status}</small>
                      </div>
                      <p className="mb-1">{r.descricao || "Sem descrição."}</p><small className="text-muted">{r.localizacao}</small>
                    </div>
                  ))
                ) : <p className="text-center text-muted">Nenhum registro encontrado.</p>}
              </div>
              {totalPaginas > 1 && (
                <nav><ul className="pagination pagination-sm justify-content-center">
                  <li className={`page-item ${paginaAtual === 1 ? 'disabled' : ''}`}><button className="page-link" onClick={paginaAnterior}>Anterior</button></li>
                  {[...Array(totalPaginas).keys()].map(num => (<li key={num + 1} className={`page-item ${paginaAtual === num + 1 ? 'active' : ''}`}><button onClick={() => irParaPagina(num + 1)} className="page-link">{num + 1}</button></li>))}
                  <li className={`page-item ${paginaAtual === totalPaginas ? 'disabled' : ''}`}><button className="page-link" onClick={proximaPagina}>Próxima</button></li>
                </ul></nav>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}