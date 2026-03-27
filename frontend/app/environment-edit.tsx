import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CaretLeft } from 'phosphor-react-native';
import { TouchableOpacity } from 'react-native';
import { AppContext } from '../src/context/AppContext';
import { Colors } from '../src/constants/colors';
import KeyValueEditor from '../src/components/KeyValueEditor';
import PrimaryButton from '../src/components/PrimaryButton';

export default function EnvironmentEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { state, dispatch } = useContext(AppContext);

  const env = state.environments.find(e => e.id === params.envId);
  const [name, setName] = useState(env?.name || '');
  const [variables, setVariables] = useState(
    (env?.variables || []).map((v, i) => ({ ...v, enabled: true, id: i.toString() }))
  );

  const handleSave = () => {
    const updatedEnv = {
      id: params.envId,
      name: name.trim(),
      variables: variables.filter(v => v.key).map(v => ({ key: v.key, value: v.value })),
    };
    dispatch({ type: 'UPDATE_ENVIRONMENT', payload: updatedEnv });
    router.back();
  };

  const handleSetActive = () => {
    dispatch({ type: 'SET_ACTIVE_ENV', payload: params.envId });
  };

  if (!env) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}><CaretLeft size={24} color={Colors.TEXT_PRIMARY} /></TouchableOpacity>
          <Text style={styles.title}>Environment Not Found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView testID="environment-edit-screen" style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.topBar}>
          <TouchableOpacity testID="env-edit-back-btn" onPress={() => router.back()} style={styles.backBtn}>
            <CaretLeft size={24} color={Colors.TEXT_PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Environment</Text>
          <TouchableOpacity testID="env-edit-save-btn" onPress={handleSave}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.label}>Name</Text>
          <TextInput testID="env-name-input" style={styles.input} value={name} onChangeText={setName} placeholder="Environment name" placeholderTextColor={Colors.TEXT_MUTED} />

          <Text style={[styles.label, { marginTop: 20 }]}>Variables</Text>
          <KeyValueEditor data={variables} onChange={setVariables} />
        </View>

        <View style={styles.bottom}>
          <PrimaryButton
            title={state.activeEnvId === params.envId ? 'Active Environment' : 'Set as Active'}
            onPress={handleSetActive}
            disabled={state.activeEnvId === params.envId}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.BACKGROUND_BASE },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { marginRight: 12 },
  title: { fontFamily: 'IBMPlexMono_500Medium', fontSize: 18, color: Colors.TEXT_PRIMARY, flex: 1 },
  saveText: { fontFamily: 'IBMPlexMono_500Medium', fontSize: 14, color: Colors.ACCENT },
  content: { flex: 1, paddingHorizontal: 16 },
  label: { fontFamily: 'IBMPlexMono_500Medium', fontSize: 13, color: Colors.TEXT_MUTED, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  input: { backgroundColor: Colors.BACKGROUND_ELEVATED, borderWidth: 1, borderColor: Colors.BORDER, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, fontFamily: 'IBMPlexMono_400Regular', fontSize: 14, color: Colors.TEXT_PRIMARY },
  bottom: { paddingHorizontal: 16, paddingBottom: 24 },
});
