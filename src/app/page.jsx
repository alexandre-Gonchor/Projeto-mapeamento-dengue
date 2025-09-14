'use client'
import Image from "next/image";
import '@/app/styles/bootstrap.css'
import MapClient from "./components/mapClient";
import { useState, useEffect } from 'react';

export default function Home() {

  const [tipo, setTipo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [localizacao, setLocalizacao] = useState('')
  const [foto, setFoto] = useState('')
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const changeTipo = (event) => [setTipo(event.target.value)]
  const changeDescricao = (event) => [setDescricao(event.target.value)]
  const changeLocalizacao = (event) => [setLocalizacao(event.target.value)]
   const changeFoto = (event) => [setFoto(event.target.value)]
  const salvarRegistro = (tipo, descricao, localizacao, foto) => { fetch('/api/registrar_Foco', { method: 'Post', body: JSON.stringify({ tipo: tipo, descricao: descricao, localizacao: localizacao, foto:foto }) }) }
  const enviar = (event)=> {event.preventDefault()
    salvarRegistro(tipo,descricao,localizacao,foto)
  }




  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setError(null); // Limpa o erro se houver sucesso
        },
        (err) => {
          setError(`Erro ao obter localização: ${err.message}`);
          setLocation(null); // Limpa a localização em caso de erro
        }
      );
    } else {
      setError('Geolocalização não é suportada por este navegador.');
    }
  };
  return (
    <>
      <div className="container py-3">
        <div className="flex content-center items-center mb-3">
          <h3>Mapeamento de Focos de Dengue</h3>
          <div>
            <button id="exportBtn" className="btn btn-outline-secondary btn-sm">Exportar JSON</button>
            <button id="importBtn" className="btn btn-outline-secondary btn-sm">Importar JSON</button>
            <button id="clearBtn" className="btn btn-outline-danger btn-sm">Limpar dados</button>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-md-8">
            <MapClient center={location ? [location.latitude, location.longitude] : [51.505, -0.09]} zoom={12} />
            <small className="text-muted">Clique no mapa para selecionar a localização do foco. Você pode arrastar o marcador antes de salvar.</small>
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
                    <input id="photo" type="file" accept="image/*" className="form-control form-control-sm" value={foto} onChange={changeFoto} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Localização (lat, lng)</label>
                    <input id="latlng" className="form-control form-control-sm" readonly value={localizacao} onChange={changeLocalizacao} />
                  </div>
                  <div className="d-grid gap-2">
                    <button id="saveReport" className="btn btn-primary" >Salvar registro</button>
                  </div>
                </form>
              </div>
            </div>

            <div className="card sidebar">
              <div className="card-body">
                <h6 className="card-title">Registros</h6>
                <div className="mb-2">
                  <select id="filterStatus" className="form-select form-select-sm">
                    <option value="all">Todos</option>
                    <option value="suspeito">Suspeito</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="resolvido">Resolvido</option>
                  </select>
                </div>
                <ul id="reportList" className="list-group"></ul>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-3 small text-muted">Protótipo local — os dados ficam no seu navegador (localStorage). Para integração real, adicione backend e envio de e-mail ao órgão responsável.</footer>
      </div>
    </>

  )
}
