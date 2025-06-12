import React, { useState } from 'react';
import {
  View, Text, TextInput, Image, TouchableOpacity, FlatList, StyleSheet, Alert
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { supabase } from "../../Bruno/app-delivery/src/lib/supabase";

const Stack = createStackNavigator();

const products = [
  { id: '1', name: 'Coxinha', price: 5, image: 'https://static.itdg.com.br/images/auto-auto/52b96f7095b56f027799bbe66dfd9532/coxinha-crocante.jpg' },
  { id: '2', name: 'Batatinha Frita', price: 7, image: 'https://img.cdndsgni.com/preview/11098398.jpg' },
  { id: '3', name: 'Refrigerante', price: 4, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqAgnJaWI8dk9bqJ4hXiNKaIzV-oDCvgOrbQ&s' },
];

function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin() {
  if (!email || !password) {
    Alert.alert('Erro', 'Por favor, preencha todos os campos.');
    return;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    Alert.alert('Erro de login', 'Email ou senha incorretos.');
    return;
  }

  navigation.navigate('Menu');
}


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Criar conta</Text>
      </TouchableOpacity>
    </View>
  );
}

function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !name || !address || !phone) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password
    });

    setLoading(false);

    if (error) {
      Alert.alert('Erro', 'Erro ao cadastrar. Tente novamente.');
      return;
    }

    Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro</Text>
      <TextInput placeholder="Nome" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Endereço" value={address} onChangeText={setAddress} style={styles.input} />
      <TextInput placeholder="Telefone" value={phone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Cadastrando...' : 'Cadastrar'}</Text>
      </TouchableOpacity>
    </View>
  );
}

function MenuScreen({ navigation }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [total, setTotal] = useState(0);

  const handleSelect = (item) => {
    setSelectedItems([...selectedItems, item]);
    setTotal(total + item.price);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escolha seu lanche</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.productItem} onPress={() => handleSelect(item)}>
            <Image source={{ uri: item.image }} style={styles.productImage} />
            <Text>{item.name} - R${item.price}</Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Resumo', { selectedItems, total })}>
        <Text style={styles.buttonText}>Próximo</Text>
      </TouchableOpacity>
    </View>
  );
}

function ResumoScreen({ navigation, route }) {
  const [selectedItems, setSelectedItems] = useState(route.params.selectedItems || []);
  const [total, setTotal] = useState(route.params.total || 0);

  const handleRemove = (index) => {
    const item = selectedItems[index];
    const newItems = [...selectedItems];
    newItems.splice(index, 1);
    setSelectedItems(newItems);
    setTotal(total - item.price);
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.productItem}>
      <Text>{item.name} - R${item.price}</Text>
      <TouchableOpacity onPress={() => handleRemove(index)}>
        <Text style={{ color: 'red' }}>Remover</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resumo do Pedido</Text>
      <FlatList
        data={selectedItems}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
      />
      <Text style={styles.total}>Total: R${total}</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Voltar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Pagamento', { total })}>
        <Text style={styles.buttonText}>Pagamento</Text>
      </TouchableOpacity>
    </View>
  );
}

function PagamentoScreen({ navigation, route }) {
  const { total } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forma de Pagamento</Text>
      {['Cartão de Crédito', 'PIX', 'Dinheiro'].map((tipo) => (
        <TouchableOpacity
          key={tipo}
          style={styles.button}
          onPress={() => navigation.navigate('Finalizacao')}>
          <Text style={styles.buttonText}>{tipo}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function FinalizacaoScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pagamento Realizado!</Text>
      <Text style={{ textAlign: 'center', marginVertical: 20 }}>
        Seu pedido foi finalizado com sucesso. Obrigado por comprar conosco!
      </Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.popToTop()}>
        <Text style={styles.buttonText}>Voltar ao Início</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen name="Resumo" component={ResumoScreen} />
        <Stack.Screen name="Pagamento" component={PagamentoScreen} />
        <Stack.Screen name="Finalizacao" component={FinalizacaoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  input: {
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    borderColor: '#ccc'
  },
  button: {
    backgroundColor: '#E02041',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 5
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#ddd'
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8
  },
  total: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  link: {
    marginTop: 10,
    color: '#E02041',
    textAlign: 'center'
  }
});
