import React, { useState, useEffect, useContext } from 'react';
import { fetchEmpresasParaAdmin, saveEmpresaConfig, uploadEmpresaLogo } from '../../services/api';
import { toast } from 'react-toastify';
import './AdminConfig.css';
import { ThemeContext } from "../../contexts/ThemeContext";

const AdminConfig = ({ onConfigSave, usuario }) => {
    const { tema } = useContext(ThemeContext);
    const isSalao = tema === 'salao';

    const [empresas, setEmpresas] = useState([]);
    const [selectedEmpresa, setSelectedEmpresa] = useState(null);
    const [currentConfig, setCurrentConfig] = useState({
        nome_exibicao: '',
        cor_primaria: '#ff9800',
        cor_secundaria: '#222222',
        logo_url: '',
        layout_tipo: 'barbearia',
    });
    const [logoFile, setLogoFile] = useState(null);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadEmpresas = async () => {
        try {
            setLoading(true);
            const data = await fetchEmpresasParaAdmin();
            setEmpresas(data);
        } catch (err) {
            toast.error(err.message || 'Erro ao carregar empresas.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEmpresas();
    }, []);

    const handleSelectEmpresa = (empresa) => {
        setSelectedEmpresa(empresa);
        // Preenche o formulário com a config existente ou valores padrão
        setCurrentConfig({
            empresa_id: empresa.id,
            nome_exibicao: empresa.configuracoes?.nome_exibicao || empresa.nome,
            cor_primaria: empresa.configuracoes?.cor_primaria || '#ff9800',
            cor_secundaria: empresa.configuracoes?.cor_secundaria || '#222222',
            logo_url: empresa.configuracoes?.logo_url || '',
            layout_tipo: empresa.configuracoes?.layout_tipo || 'barbearia',
        });
        setLogoFile(null);
    };

    const handleConfigChange = (e) => {
        const { name, value } = e.target;
        setCurrentConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const savedData = await saveEmpresaConfig(currentConfig);
            toast.success('Configurações salvas com sucesso!');

            // ✅ NOVO: Avisa o App.jsx sobre a mudança para atualizar as cores em tempo real
            if (onConfigSave) {
                onConfigSave(savedData);
            }

            await loadEmpresas();
        } catch (err) {
            toast.error(err.message || 'Erro ao salvar configurações.');
        } finally {
            setSaving(false);
        }
    };

    const handleFileChange = (e) => {
        setLogoFile(e.target.files[0]);
    };

    const handleLogoUpload = async () => {
        if (!logoFile || !selectedEmpresa) return;

        setUploadingLogo(true);
        try {
            const savedData = await uploadEmpresaLogo(selectedEmpresa.id, logoFile);
            toast.success('Logo enviado com sucesso!');

            setCurrentConfig(prev => ({ ...prev, logo_url: savedData.logo_url }));

            if (onConfigSave) {
                onConfigSave(savedData);
            }
            await loadEmpresas(); // Recarrega para atualizar o emoji 🎨
        } catch (err) {
            toast.error(err.message || 'Erro ao enviar logo.');
        } finally {
            setUploadingLogo(false);
        }
    };

    const content = (
        <>
            <h1>Painel de Administração</h1>
            <p>Selecione uma empresa para personalizar sua aparência e funcionalidades.</p>

            {loading && <p>Carregando empresas...</p>}

            <div className="admin-config-layout">
                <div className="empresas-list">
                    <h3>Empresas Cadastradas</h3>
                    <ul>
                        {empresas.map(empresa => (
                            <li
                                key={empresa.id}
                                onClick={() => handleSelectEmpresa(empresa)}
                                className={selectedEmpresa?.id === empresa.id ? 'selected' : ''}
                            >
                                {empresa.nome}
                                {empresa.configuracoes && <span className="customized-indicator">🎨</span>}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="config-form-section">
                    {selectedEmpresa ? (
                        <form onSubmit={handleSave}>
                            <h3>Configurações para: {selectedEmpresa.nome}</h3>
                            
                            <div className="form-group">
                                <label htmlFor="nome_exibicao">Nome de Exibição</label>
                                <input
                                    type="text"
                                    id="nome_exibicao"
                                    name="nome_exibicao"
                                    value={currentConfig.nome_exibicao}
                                    onChange={handleConfigChange}
                                    placeholder="Nome que aparecerá no sistema"
                                />
                            </div>

                            <div className="form-group-inline">
                                <div className="form-group">
                                    <label htmlFor="cor_primaria">Cor Primária</label>
                                    <input
                                        type="color"
                                        id="cor_primaria"
                                        name="cor_primaria"
                                        value={currentConfig.cor_primaria}
                                        onChange={handleConfigChange}
                                    />
                                    <span>{currentConfig.cor_primaria}</span>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="cor_secundaria">Cor Secundária</label>
                                    <input
                                        type="color"
                                        id="cor_secundaria"
                                        name="cor_secundaria"
                                        value={currentConfig.cor_secundaria}
                                        onChange={handleConfigChange}
                                    />
                                    <span>{currentConfig.cor_secundaria}</span>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="layout_tipo">Tipo de Tema</label>
                                <select
                                    id="layout_tipo"
                                    name="layout_tipo"
                                    value={currentConfig.layout_tipo}
                                    onChange={handleConfigChange}
                                >
                                    <option value="barbearia">Barbearia</option>
                                    <option value="salao">Salão</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Logo da Empresa</label>
                                {currentConfig.logo_url && (
                                    <div className="logo-preview">
                                        <img src={currentConfig.logo_url} alt="Logo atual" />
                                    </div>
                                )}
                                <input type="file" accept="image/png, image/jpeg" onChange={handleFileChange} />
                                <button
                                    type="button"
                                    className="button button-secondary"
                                    onClick={handleLogoUpload}
                                    disabled={!logoFile || uploadingLogo}
                                >
                                    {uploadingLogo ? 'Enviando...' : 'Enviar Novo Logo'}
                                </button>
                            </div>

                            <button type="submit" className="button" disabled={saving}>
                                {saving ? 'Salvando...' : 'Salvar Configurações'}
                            </button>
                        </form>
                    ) : (
                        <div className="placeholder-text">
                            <p>Selecione uma empresa na lista ao lado para começar.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );

    return (
        <div className="admin-config-container">
            {content}
        </div>
    );
};

export default AdminConfig;