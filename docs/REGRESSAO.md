# Defeito real e regressão

O carregador preservava a release em sessionStorage entre acessos. Após rollback, uma sessão já aberta podia continuar na versão retirada, porque o código verificava somente se a release ainda existia. Releases são preservadas para auditoria, portanto existência não implica aprovação.

Correção: o carregador também consulta rollout.revogadas e migra a sessão para a versão estável. O rollback mantém o artefato para auditoria, registra a revogação e atualiza version.json da raiz.

tests/loader.test.cjs reproduz a sessão com release revogada e confirma o redirecionamento; também confirma preservação de sessões válidas e rejeição de identificador inválido. Este defeito de software é diferente do programa intencionalmente errado da quarta missão.
