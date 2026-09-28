import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, SafeAreaView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { supabase } from './lib/supabase';

type Time = {
  id: number;
  nome: string;
  cidade: string | null;
  fundacao: number | null;
  estadio: string | null;
  titulos: number | null;
  ativo: boolean;
  criado_em: string;
};

export default function App() {
  const [times, setTimes] = useState<Time[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [atualizando, setAtualizando] = useState(false);

  const [nome, setNome] = useState('');
  const [cidade, setCidade] = useState('');
  const [fundacao, setFundacao] = useState('');
  const [estadio, setEstadio] = useState('');
  const [titulos, setTitulos] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  useEffect(() => {
    listar();
  }, []);

  // READ
  async function listar() {
    const primeiraCarga = times.length === 0;
    if (primeiraCarga) setCarregando(true);

    const { data, error } = await supabase
      .from('times')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      Alert.alert('Erro ao listar', error.message);
    } else {
      setTimes((data ?? []) as Time[]);
    }

    setCarregando(false);
    setAtualizando(false);
  }

  function limparFormulario() {
    setNome('');
    setCidade('');
    setFundacao('');
    setEstadio('');
    setTitulos('');
    setAtivo(true);
    setEditandoId(null);
  }

  function validarNumero(valor: string, campo: string) {
    if (valor.trim() !== '' && Number.isNaN(Number(valor))) {
      Alert.alert('Atenção', `${campo} deve ser um número.`);
      return false;
    }
    return true;
  }

  // CREATE e UPDATE
  async function salvar() {
    if (nome.trim() === '' || cidade.trim() === '' || estadio.trim() === '') {
      Alert.alert('Atenção', 'Preencha nome, cidade e estádio.');
      return;
    }

    if (!validarNumero(fundacao, 'Ano de fundação')) return;
    if (!validarNumero(titulos, 'Número de títulos')) return;

    const ano = fundacao.trim() === '' ? null : Number(fundacao);
    const quantidadeTitulos = titulos.trim() === '' ? null : Number(titulos);

    if (ano !== null && (!Number.isInteger(ano) || ano < 1800 || ano > new Date().getFullYear())) {
      Alert.alert('Atenção', 'Informe um ano de fundação válido.');
      return;
    }

    if (quantidadeTitulos !== null && (!Number.isInteger(quantidadeTitulos) || quantidadeTitulos < 0)) {
      Alert.alert('Atenção', 'O número de títulos deve ser um inteiro maior ou igual a zero.');
      return;
    }

    const registro = {
      nome: nome.trim(),
      cidade: cidade.trim(),
      fundacao: ano,
      estadio: estadio.trim(),
      titulos: quantidadeTitulos,
      ativo,
    };

    setSalvando(true);

    const { error } =
      editandoId === null
        ? await supabase.from('times').insert(registro)
        : await supabase.from('times').update(registro).eq('id', editandoId);

    setSalvando(false);

    if (error) {
      Alert.alert('Erro ao salvar', error.message);
      return;
    }

    limparFormulario();
    await listar();
  }

  function editar(item: Time) {
    setEditandoId(item.id);
    setNome(item.nome);
    setCidade(item.cidade ?? '');
    setFundacao(item.fundacao === null ? '' : String(item.fundacao));
    setEstadio(item.estadio ?? '');
    setTitulos(item.titulos === null ? '' : String(item.titulos));
    setAtivo(item.ativo);
  }

  // DELETE
  function excluir(item: Time) {
    Alert.alert('Excluir time', `Deseja remover ${item.nome}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('times').delete().eq('id', item.id);

          if (error) {
            Alert.alert('Erro ao excluir', error.message);
            return;
          }

          if (editandoId === item.id) limparFormulario();
          await listar();
        },
      },
    ]);
  }

  async function atualizarLista() {
    setAtualizando(true);
    await listar();
  }

  return (
    <SafeAreaView style={estilos.container}>
      <Text style={estilos.titulo}>Cadastro de Times</Text>

      <View style={estilos.formulario}>
        <TextInput
          style={estilos.campo}
          placeholder="Nome do time *"
          value={nome}
          onChangeText={setNome}
        />
        <TextInput
          style={estilos.campo}
          placeholder="Cidade *"
          value={cidade}
          onChangeText={setCidade}
        />
        <TextInput
          style={estilos.campo}
          placeholder="Estádio *"
          value={estadio}
          onChangeText={setEstadio}
        />
        <TextInput
          style={estilos.campo}
          placeholder="Ano de fundação"
          value={fundacao}
          onChangeText={setFundacao}
          keyboardType="numeric"
        />
        <TextInput
          style={estilos.campo}
          placeholder="Número de títulos"
          value={titulos}
          onChangeText={setTitulos}
          keyboardType="numeric"
        />

        <View style={estilos.switchLinha}>
          <Text style={estilos.switchTexto}>Time ativo</Text>
          <Switch value={ativo} onValueChange={setAtivo} />
        </View>

        <View style={estilos.linhaBotoes}>
          <Pressable
            style={[estilos.botao, salvando && estilos.botaoDesabilitado]}
            onPress={salvar}
            disabled={salvando}
          >
            <Text style={estilos.textoBotao}>
              {salvando
                ? 'Salvando...'
                : editandoId === null
                  ? 'Cadastrar'
                  : 'Salvar alterações'}
            </Text>
          </Pressable>

          {editandoId !== null && (
            <Pressable style={estilos.botaoSecundario} onPress={limparFormulario}>
              <Text style={estilos.textoBotaoSecundario}>Cancelar</Text>
            </Pressable>
          )}
        </View>
      </View>

      <Text style={estilos.secaoTitulo}>Times cadastrados</Text>

      {carregando ? (
        <ActivityIndicator style={estilos.carregando} />
      ) : (
        <FlatList
          data={times}
          keyExtractor={(item) => String(item.id)}
          refreshing={atualizando}
          onRefresh={atualizarLista}
          contentContainerStyle={times.length === 0 ? estilos.listaVazia : undefined}
          ListEmptyComponent={<Text style={estilos.vazio}>Nenhum time cadastrado.</Text>}
          renderItem={({ item }) => (
            <View style={estilos.item}>
              <View style={estilos.itemConteudo}>
                <Text style={estilos.itemNome}>{item.nome}</Text>
                <Text style={estilos.itemDetalhe}>
                  {item.cidade ?? 'sem cidade'} · {item.estadio ?? 'sem estádio'}
                </Text>
                <Text style={estilos.itemDetalhe}>
                  Fundação: {item.fundacao ?? 'não informada'} · Títulos: {item.titulos ?? 'não informado'}
                </Text>
                <Text style={item.ativo ? estilos.ativo : estilos.inativo}>
                  {item.ativo ? 'Ativo' : 'Inativo'}
                </Text>
              </View>

              <View style={estilos.acoes}>
                <Pressable onPress={() => editar(item)}>
                  <Text style={estilos.acao}>Editar</Text>
                </Pressable>
                <Pressable onPress={() => excluir(item)}>
                  <Text style={estilos.acaoPerigo}>Excluir</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
  },
  titulo: {
    fontSize: 26,
    fontWeight: '700',
  },
  formulario: {
    gap: 8,
  },
  campo: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  switchLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  switchTexto: {
    fontSize: 15,
  },
  linhaBotoes: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  botao: {
    backgroundColor: '#3ECF8E',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  botaoDesabilitado: {
    opacity: 0.6,
  },
  textoBotao: {
    color: '#04342C',
    fontWeight: '700',
  },
  botaoSecundario: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  textoBotaoSecundario: {
    color: '#555',
  },
  secaoTitulo: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 22,
    marginBottom: 6,
  },
  carregando: {
    marginTop: 24,
  },
  listaVazia: {
    flexGrow: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemConteudo: {
    flex: 1,
  },
  itemNome: {
    fontSize: 16,
    fontWeight: '700',
  },
  itemDetalhe: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  ativo: {
    fontSize: 12,
    marginTop: 4,
    color: '#1b7f55',
    fontWeight: '600',
  },
  inativo: {
    fontSize: 12,
    marginTop: 4,
    color: '#777',
    fontWeight: '600',
  },
  acoes: {
    gap: 10,
    alignItems: 'flex-end',
  },
  acao: {
    color: '#185FA5',
    fontWeight: '600',
  },
  acaoPerigo: {
    color: '#A32D2D',
    fontWeight: '600',
  },
  vazio: {
    textAlign: 'center',
    marginTop: 24,
    color: '#888',
  },
});
