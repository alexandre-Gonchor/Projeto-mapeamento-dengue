import Image from "next/image";
import '@/app/styles/bootstrap.css'

export default function Home() {
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
          <div id="map"></div>
          <small className="text-muted">Clique no mapa para selecionar a localização do foco. Você pode arrastar o marcador antes de salvar.</small>
        </div>

        <div className="col-md-4">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Registrar possível foco</h5>
              <form id="reportForm">
                <div className="mb-2">
                  <label className="form-label">Tipo</label>
                  <select id="type" className="form-select" required>
                    <option value="Água parada">Água parada</option>
                    <option value="Lixo">Lixo</option>
                    <option value="Pneu">Pneu</option>
                    <option value="Caixa d'água destampada">Caixa d'água destampada</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label">Descrição</label>
                  <textarea id="description" className="form-control" rows="2"></textarea>
                </div>
                <div className="mb-2">
                  <label className="form-label">Foto (opcional)</label>
                  <input id="photo" type="file" accept="image/*" className="form-control form-control-sm"/>
                </div>
                <div className="mb-2">
                  <label className="form-label">Localização (lat, lng)</label>
                  <input id="latlng" className="form-control form-control-sm" readonly/>
                </div>
                <div className="d-grid gap-2">
                  <button id="saveReport" className="btn btn-primary">Salvar registro</button>
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
