function processaPedido(pedido) {
    // calcula taxa
    if (pedido && pedido.valorTotal && pedido.taxaPercentual) {
        const taxa = (pedido.valorTotal * pedido.taxaPercentual) / 2;
        console.log(`Taxa calculada: R$ ${taxa.toFixed(2)}`);
    } else {
        console.log("Dados do pedido incompletos para calcular a taxa.");
    }
    // valida estoque
    if (pedido && pedido.produtos && Array.isArray(pedido.produtos)) {
        for (const produto of pedido.produtos) {
            vldEstoq(produto.codEstoque, produto.mercod, produto.quantidade, (status, mensagem) => {
                if (status !== 1) {
                    console.log(`Produto ${produto.mercod} não disponível no estoque: ${mensagem}`);
                } else {
                    console.log(`Produto ${produto.mercod} validado no estoque.`);
                }
            });
        }
    } else {
        console.log("Dados do pedido ou produtos estão inválidos.");
    }

    // gera invoice
    const invoice = {
        numero: `INV-${new Date().getTime()}`,
        data: new Date().toLocaleDateString(),
        cliente: pedido.cliente || "Cliente não informado",
        itens: [],
        total: 0
    };
    pedido.produtos.forEach(produto => {
        const item = {
            descricao: produto.descricao || "Produto sem descrição",
            quantidade: produto.quantidade || 0,
            precoUnitario: produto.preco || 0,
            total: (produto.quantidade || 0) * (produto.preco || 0)
        };
        invoice.itens.push(item);
        invoice.total += item.total;
    });
    console.log("Invoice gerado:", invoice);

    // envia email de confirmação
    if (pedido && pedido.clienteEmail) {
        const emailData = {
            to: pedido.clienteEmail,
            subject: `Confirmação do Pedido ${invoice.numero}`,
            body: `
                Olá ${pedido.cliente || "Cliente"},
                
                Obrigado por realizar seu pedido conosco. Seguem os detalhes do seu pedido:
                
                Número do Pedido: ${invoice.numero}
                Data: ${invoice.data}
                Total: R$ ${invoice.total.toFixed(2)}
                
                Itens:
                ${invoice.itens.map(item => `- ${item.descricao}: ${item.quantidade} x R$ ${item.precoUnitario.toFixed(2)} = R$ ${item.total.toFixed(2)}`).join('\n')}
                
                Agradecemos pela preferência.
                
                Atenciosamente,
                Equipe Angeloni
            `
        };

        sendEmail(emailData)
            .then(() => {
                console.log(`Email de confirmação enviado para ${pedido.clienteEmail}`);
            })
            .catch((error) => {
                console.log(`Erro ao enviar email para ${pedido.clienteEmail}:`, error);
            });
    } else {
        console.log("Email do cliente não informado. Não foi possível enviar a confirmação.");
    }
}
