# 3D Print Pro Calculator — PWA

Versão PWA para iPhone, iPad, Android e computador.

## Executar no Windows

A forma mais simples é usar o VS Code e uma extensão de servidor local, como Live Server.

1. Extraia o ZIP.
2. Abra a pasta no VS Code.
3. Abra `index.html` com um servidor local.
4. Teste no navegador.

Para instalar no iPhone como PWA, publique a pasta em HTTPS (por exemplo, hospedagem estática) e abra o endereço pelo Safari.

## Recursos
- Dashboard de custo, venda, total e lucro.
- Todas as fórmulas da calculadora Streamlit original.
- Simulador de 1 a 20 peças.
- Gráfico.
- Geração de orçamento para impressão.
- Compartilhamento pelo menu nativo do iPhone quando disponível.
- Impressão/salvamento como PDF pelo navegador.
- Histórico local.
- Reutilização de orçamento.
- Tema claro/escuro.
- Dados persistidos no dispositivo.
- Manifest + Service Worker para instalação como PWA.

## Fórmulas preservadas
Filamento = peso × preço/kg ÷ 1000
Energia = horas × potência(kW) × preço/kWh
Desgaste = horas × (preço da impressora ÷ vida útil)
Manutenção = horas × R$ 0,30
Mão de obra = horas próprias × valor/hora
Custo/peça = custos por peça + embalagem
Preço/peça = custo × (1 + lucro/100)
