'use client'
import Image from "next/image";
import '@/app/styles/bootstrap.css'
import MapClient from "./components/mapClient";
import { useState, useEffect, useMemo } from 'react';

export default function Home() {

  const [tipo, setTipo] = useState('Água parada');
  const [descricao, setDescricao] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [foto, setFoto] = useState('');
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [registros, setRegistros] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [registrosPorPagina] = useState(5);
  const [filtroStatus, setFiltroStatus] = useState('all');
  const [recenterRequest, setRecenterRequest] = useState(null);
  const [popupToOpenId, setPopupToOpenId] = useState(null);

  const changeTipo = (event) => setTipo(event.target.value);
  const changeDescricao = (event) => setDescricao(event.target.value);
  const changeLocalizacao = (event) => setLocalizacao(event.target.value);
  const changeFoto = (event) => setFoto(event.target.value);

  const buscarRegistros = async () => {
    try {
      const response = await fetch('/api/pegar_foco');
      if (!response.ok) throw new Error('Falha na resposta da API');
      const data = await response.json();
      setRegistros(data);
    } catch (err) {
      console.error("Erro ao buscar registros:", err);
    }
  };

  const salvarRegistro = async (tipo, descricao, localizacao, foto) => {
    try {
      const response = await fetch('/api/registrar_Foco', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, descricao, localizacao, foto, status: 'suspeito' })
      });
      if (!response.ok) throw new Error('Falha ao salvar registro');
      await buscarRegistros();
    } catch (err) {
      console.error("Erro ao salvar registro:", err);
      alert("Houve um erro ao tentar salvar o registro.");
    }
  };

  const handleStatusChange = async (registroId, novoStatus) => {
    try {
      const response = await fetch('/api/atualizar_status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: registroId, status: novoStatus }),
      });
      if (!response.ok) throw new Error('Falha ao atualizar o status.');
      await buscarRegistros();
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      alert("Houve um erro ao tentar atualizar o status do registro.");
    }
  };

  const enviar = (event) => {
    event.preventDefault();
    if (!localizacao) {
      alert("Por favor, selecione uma localização clicando no mapa.");
      return;
    }
    salvarRegistro(tipo, descricao, localizacao, foto);
    setTipo('Água parada');
    setDescricao('');
    setLocalizacao('');
    setFoto('');
  };

  useEffect(() => {
    getLocation();
    buscarRegistros();
  }, []);

  const registrosFiltrados = useMemo(() => {
    if (filtroStatus === 'all') return registros;
    return registros.filter(registro => registro.status === filtroStatus);
  }, [registros, filtroStatus]);

  const totalPaginas = Math.ceil(registrosFiltrados.length / registrosPorPagina);
  const indiceUltimoRegistro = paginaAtual * registrosPorPagina;
  const indicePrimeiroRegistro = indiceUltimoRegistro - registrosPorPagina;
  const registrosAtuais = registrosFiltrados.slice(indicePrimeiroRegistro, indiceUltimoRegistro);

  const proximaPagina = () => { if (paginaAtual < totalPaginas) setPaginaAtual(paginaAtual + 1); };
  const paginaAnterior = () => { if (paginaAtual > 1) setPaginaAtual(paginaAtual - 1); };
  const irParaPagina = (numeroPagina) => setPaginaAtual(numeroPagina);

  const handleFiltroChange = (event) => {
    setFiltroStatus(event.target.value);
    setPaginaAtual(1);
  };

  const mapCenter = useMemo(() => {
    return location
      ? [location.latitude, location.longitude]
      : [-20.4697, -54.6201];
  }, [location]);

  const getLocation = () => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
          setError(null);
          setIsLoading(false);
        },
        (err) => {
          setError(`Erro ao obter localização: ${err.message}`);
          setLocation(null);
          setIsLoading(false);
        }
      );
    } else {
      setError('Geolocalização não é suportada por este navegador.');
      setIsLoading(false);
    }
  };

  const handleMapClick = (latlng) => {
    const formattedCoords = `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
    setLocalizacao(formattedCoords);
  };

  const handleRecenter = () => {
    if (location) {
      setRecenterRequest({ ...location });
    } else {
      alert("Localização ainda não obtida. Por favor, aguarde ou permita o acesso.");
      getLocation();
    }
  };

  const handleRegistroClick = (registro) => {
    if (registro.localizacao && typeof registro.localizacao === 'string') {
      const coordsArray = registro.localizacao.split(',').map(coord => parseFloat(coord.trim()));
      if (coordsArray.length === 2 && !isNaN(coordsArray[0]) && !isNaN(coordsArray[1])) {
        setRecenterRequest({ latitude: coordsArray[0], longitude: coordsArray[1] });
      }
    }
    setPopupToOpenId(registro.id);
  };

  return (
    <>
      <div className="container py-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Mapeamento de Focos de Dengue</h3>
          <div>
            <button id="exportBtn" className="btn btn-outline-secondary btn-sm me-1">Exportar JSON</button>
            <button id="importBtn" className="btn btn-outline-secondary btn-sm me-1">Importar JSON</button>
            <button id="clearBtn" className="btn btn-outline-danger btn-sm">Limpar dados</button>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-md-8">
            {isLoading ? (
              <div className="d-flex justify-content-center align-items-center rounded" style={{ height: "400px", backgroundColor: "#e9ecef" }}>
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Obtendo sua localização para carregar o mapa...</p>
                </div>
              </div>
            ) : (
              <MapClient
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
              <button className="btn btn-outline-primary btn-sm" onClick={handleRecenter} disabled={isLoading}>
                📍 Ir para minha localização
              </button>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">Registrar possível foco</h5>
                <form id="reportForm" onSubmit={enviar}>
                  <div className="mb-2">
                    <label className="form-label">Tipo</label>
                    <select id="type" className="form-select" required value={tipo} onChange={changeTipo}>
                      <option value="Água parada">Água parada</option>
                      <option value="Lixo">Lixo</option>
                      <option value="Pneu">Pneu</option>
                      <option value="Caixa d'água destampada">Caixa d'água destampada</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Descrição</label>
                    <textarea id="description" className="form-control" rows="2" value={descricao} onChange={changeDescricao}></textarea>
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Foto (opcional)</label>
                    <input id="photo" type="file" accept="image/*" className="form-control form-control-sm" onChange={changeFoto} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Localização (lat, lng)</label>
                    <input id="latlng" className="form-control form-control-sm" readOnly placeholder="Clique no mapa para selecionar" value={localizacao} onChange={changeLocalizacao} />
                  </div>
                  <div className="d-grid gap-2">
                    <button type="submit" id="saveReport" className="btn btn-primary">Salvar registro</button>
                  </div>
                </form>
              </div>
            </div>

            <div className="card sidebar">
              <div className="card-body">
                <h6 className="card-title">Registros Recentes</h6>
                <div className="mb-2">
                  <select
                    id="filterStatus"
                    className="form-select form-select-sm"
                    value={filtroStatus}
                    onChange={handleFiltroChange}
                  >
                    <option value="all">Todos</option>
                    <option value="suspeito">Suspeito</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="resolvido">Resolvido</option>
                  </select>
                </div>

                <div id="reportList" className="list-group mb-3">
                  {registrosAtuais.length > 0 ? (
                    registrosAtuais.map(registro => (
                      <div
                        key={registro.id}
                        className="list-group-item list-group-item-action"
                        onClick={() => handleRegistroClick(registro)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="d-flex w-100 justify-content-between">
                          <h6 className="mb-1">📌 {registro.tipo}</h6>
                          <small className={`badge bg-${registro.status === 'resolvido' ? 'success' : (registro.status === 'confirmado' ? 'danger' : 'warning')} text-dark`}>{registro.status}</small>
                        </div>
                        <p className="mb-1">{registro.descricao || "Sem descrição."}</p>
                        <small className="text-muted">{registro.localizacao}</small>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted">Nenhum registro encontrado.</p>
                  )}
                </div>

                {totalPaginas > 1 && (
                  <nav>
                    <ul className="pagination pagination-sm justify-content-center">
                      <li className={`page-item ${paginaAtual === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={paginaAnterior}>Anterior</button>
                      </li>
                      {[...Array(totalPaginas).keys()].map(numero => (
                        <li key={numero + 1} className={`page-item ${paginaAtual === numero + 1 ? 'active' : ''}`}>
                          <button onClick={() => irParaPagina(numero + 1)} className="page-link">
                            {numero + 1}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${paginaAtual === totalPaginas ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={proximaPagina}>Próxima</button>
                      </li>
                    </ul>
                  </nav>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}