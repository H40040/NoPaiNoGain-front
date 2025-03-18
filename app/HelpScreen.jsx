import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Button from '../components/Button';
import theme from '../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HelpScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        setUserName(userData.name || '');
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.push('/')} style={styles.homeButton}>
              <MaterialCommunityIcons name="home" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <Text style={styles.title}>Guia de Uso</Text>
            <TouchableOpacity onPress={() => router.push('/ProfileScreen')} style={styles.profileButton}>
              <MaterialCommunityIcons name="account-circle" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>
            {userName ? `Olá ${userName}! Aprenda a usar o No Pain No Gain para maximizar seus resultados` : 'Aprenda a usar o No Pain No Gain para maximizar seus resultados'}
          </Text>

          <View style={styles.content}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="robot" size={24} color={theme.colors.primary} />
                <Text style={styles.sectionTitle}>Geração de Treinos com IA</Text>
              </View>
              <Text style={styles.sectionText}>
                Nosso aplicativo utiliza inteligência artificial para criar treinos personalizados
                com base nas suas informações e objetivos. Siga os passos abaixo para gerar seu treino:
              </Text>

              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Acesse o formulário de anamnese</Text>
                  <Text style={styles.stepText}>
                    Na tela de Treinos, toque no botão "Gerar Treino com IA" para acessar o formulário.
                  </Text>
                </View>
              </View>

              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Preencha suas informações</Text>
                  <Text style={styles.stepText}>
                    Forneça informações precisas sobre seu perfil físico, objetivos, nível de condicionamento,
                    restrições médicas e preferências de exercícios.
                  </Text>
                </View>
              </View>

              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Gere seu treino personalizado</Text>
                  <Text style={styles.stepText}>
                    Toque em "Gerar Treino Personalizado" e aguarde enquanto nossa IA cria um programa
                    específico para suas necessidades.
                  </Text>
                </View>
              </View>

              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>4</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Revise e personalize</Text>
                  <Text style={styles.stepText}>
                    Após a geração, você pode revisar e ajustar os exercícios, séries e repetições
                    antes de salvar o treino.
                  </Text>
                </View>
              </View>

              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>5</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Salve e comece a treinar</Text>
                  <Text style={styles.stepText}>
                    Salve o treino gerado e ele estará disponível na sua lista de treinos para
                    você começar a usar imediatamente.
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="lightbulb-on" size={24} color={theme.colors.primary} />
                <Text style={styles.sectionTitle}>Dicas para Melhores Resultados</Text>
              </View>

              <View style={styles.tip}>
                <MaterialCommunityIcons name="check-circle" size={20} color={theme.colors.success} />
                <Text style={styles.tipText}>
                  <Text style={styles.bold}>Seja específico:</Text> Quanto mais detalhes você fornecer,
                  melhor será o treino gerado.
                </Text>
              </View>

              <View style={styles.tip}>
                <MaterialCommunityIcons name="check-circle" size={20} color={theme.colors.success} />
                <Text style={styles.tipText}>
                  <Text style={styles.bold}>Mencione limitações:</Text> Informe qualquer lesão ou condição
                  médica para que a IA possa adaptar o treino.
                </Text>
              </View>

              <View style={styles.tip}>
                <MaterialCommunityIcons name="check-circle" size={20} color={theme.colors.success} />
                <Text style={styles.tipText}>
                  <Text style={styles.bold}>Explique seus objetivos:</Text> Além de selecionar um objetivo
                  principal, você pode detalhar suas metas.
                </Text>
              </View>

              <View style={styles.tip}>
                <MaterialCommunityIcons name="check-circle" size={20} color={theme.colors.success} />
                <Text style={styles.tipText}>
                  <Text style={styles.bold}>Seja realista:</Text> Informe um tempo de treino e frequência
                  semanal que você realmente conseguirá cumprir.
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="frequently-asked-questions" size={24} color={theme.colors.primary} />
                <Text style={styles.sectionTitle}>Perguntas Frequentes</Text>
              </View>

              <View style={styles.faq}>
                <Text style={styles.faqQuestion}>
                  A IA considera minhas lesões e limitações?
                </Text>
                <Text style={styles.faqAnswer}>
                  Sim! Por isso é importante preencher o campo de restrições com informações detalhadas
                  sobre suas lesões ou limitações físicas.
                </Text>
              </View>

              <View style={styles.faq}>
                <Text style={styles.faqQuestion}>
                  Posso editar o treino gerado pela IA?
                </Text>
                <Text style={styles.faqAnswer}>
                  Absolutamente! Após a geração, você pode adicionar, remover ou modificar exercícios,
                  ajustar séries e repetições, e personalizar o treino como preferir.
                </Text>
              </View>

              <View style={styles.faq}>
                <Text style={styles.faqQuestion}>
                  Com que frequência posso gerar novos treinos?
                </Text>
                <Text style={styles.faqAnswer}>
                  Você pode gerar quantos treinos quiser! Recomendamos criar um novo treino a cada
                  4-6 semanas para manter o progresso e evitar a estagnação.
                </Text>
              </View>
            </View>

            <Button
              title="Voltar para Treinos"
              onPress={() => router.push('/workouts')}
              style={styles.button}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  homeButton: {
    marginRight: theme.spacing.md,
  },
  profileButton: {
    marginLeft: theme.spacing.md,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.xl,
  },
  content: {
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  sectionText: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  step: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    marginTop: 2,
  },
  stepNumberText: {
    ...theme.typography.subtitle,
    color: theme.colors.white,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    ...theme.typography.subtitle,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  stepText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  tip: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    alignItems: 'flex-start',
  },
  tipText: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  bold: {
    fontWeight: 'bold',
  },
  faq: {
    marginBottom: theme.spacing.md,
  },
  faqQuestion: {
    ...theme.typography.subtitle,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  faqAnswer: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  button: {
    marginTop: theme.spacing.md,
  },
});
