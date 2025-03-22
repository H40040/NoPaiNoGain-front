// app/index.js (refatorado)
import React, { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from '../store/slices/authSlice';

export default function IndexScreen() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);


  return isAuthenticated ? <Redirect href="/DashboardScreen" /> : <Redirect href="/LoginScreen" />;
}








// import React, { useEffect, useState } from 'react';
// import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
// import { useRouter, Redirect } from 'expo-router';
// import { useSelector, useDispatch } from 'react-redux';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { fetchWorkouts } from '../../store/slices/workoutSlice';
// import { checkAuth, clearSessionExpired } from '../store/slices/authSlice';
// import { storage } from '../utils/storage';
// import theme from '../theme';

// // Importar authManager apenas após a inicialização do Redux
// let startSessionMonitoring, updateActivity, validateAuthentication, setDispatch;
// try {
//   const authManager = require('../utils/authManager');
//   startSessionMonitoring = authManager.startSessionMonitoring;
//   updateActivity = authManager.updateActivity;
//   validateAuthentication = authManager.validateAuthentication;
//   setDispatch = authManager.setDispatch;
// } catch (error) {
//   console.error('Erro ao importar authManager:', error);
//   // Funções de fallback para evitar erros
//   startSessionMonitoring = () => {};
//   updateActivity = () => {};
//   validateAuthentication = async () => true;
//   setDispatch = () => {};
// }

// export default function DashboardScreen() {
//   const router = useRouter();
//   const dispatch = useDispatch();
  
//   // Configurar o dispatch no authManager
//   useEffect(() => {
//     if (setDispatch) {
//       setDispatch(dispatch);
//     }
//   }, [dispatch]);
  
//   // Usar seletor com verificação de segurança
//   const authState = useSelector((state) => state?.auth) || {};
//   const { isAuthenticated = false, loading = false, sessionExpired = false, user = null } = authState;
  
//   // Usar seletor com verificação de segurança para workouts
//   const workoutsState = useSelector((state) => state?.workouts) || {};
//   const workouts = workoutsState.workouts || [];
  
//   const [profileImage, setProfileImage] = useState(null);
//   const [userName, setUserName] = useState('');
  
//   // Efeito para verificar autenticação ao montar o componente
//   useEffect(() => {
//     const checkAuthentication = async () => {
//       try {
//         // Verificar se o usuário está autenticado
//         await dispatch(checkAuth());
//       } catch (error) {
//         console.error('Erro ao verificar autenticação:', error);
//       }
//     };
    
//     checkAuthentication();
//   }, [dispatch]);
  
//   // Efeito para iniciar monitoramento de sessão quando autenticado
//   useEffect(() => {
//     if (isAuthenticated && startSessionMonitoring) {
//       try {
//         // Iniciar monitoramento de sessão
//         startSessionMonitoring(() => {
//           // Callback executado quando a sessão expirar por inatividade
//           Alert.alert(
//             "Sessão expirada",
//             "Sua sessão expirou devido a inatividade. Por favor, faça login novamente.",
//             [{ text: "OK", onPress: () => router.replace('/LoginScreen') }]
//           );
//           dispatch({ type: 'auth/sessionExpired' });
//         });
        
//         // Carregar dados do usuário e workouts
//         dispatch(fetchWorkouts());
//         loadUserData();
        
//         // Configurar listener para atualizar atividade
//         const updateUserActivity = () => {
//           if (updateActivity) {
//             updateActivity();
//           }
//         };
        
//         // Atualizar atividade a cada interação do usuário
//         const interval = setInterval(updateUserActivity, 60000); // A cada minuto
        
//         return () => {
//           clearInterval(interval);
//         };
//       } catch (error) {
//         console.error('Erro ao iniciar monitoramento de sessão:', error);
//       }
//     }
//   }, [isAuthenticated, dispatch]);
  
//   // Efeito para redirecionar quando a sessão expirar
//   useEffect(() => {
//     if (sessionExpired) {
//       try {
//         router.replace('/LoginScreen');
//         // Limpar flag de sessão expirada após redirecionar
//         dispatch(clearSessionExpired());
//       } catch (error) {
//         console.error('Erro ao redirecionar após sessão expirada:', error);
//       }
//     }
//   }, [sessionExpired, router, dispatch]);
  
//   // Efeito para verificar periodicamente a validade do token
//   useEffect(() => {
//     if (isAuthenticated && validateAuthentication) {
//       try {
//         const tokenValidationInterval = setInterval(async () => {
//           try {
//             const isValid = await validateAuthentication();
//             if (!isValid) {
//               Alert.alert(
//                 "Sessão expirada",
//                 "Sua sessão expirou. Por favor, faça login novamente.",
//                 [{ text: "OK", onPress: () => router.replace('/LoginScreen') }]
//               );
//               dispatch({ type: 'auth/sessionExpired' });
//             }
//           } catch (error) {
//             console.error('Erro ao validar token:', error);
//           }
//         }, 5 * 60 * 1000); // Verificar a cada 5 minutos
        
//         return () => {
//           clearInterval(tokenValidationInterval);
//         };
//       } catch (error) {
//         console.error('Erro ao configurar validação periódica de token:', error);
//       }
//     }
//   }, [isAuthenticated, dispatch, router]);
  
//   const loadUserData = async () => {
//     try {
//       if (user) {
//         setUserName(user.name || '');
        
//         // Carregar imagem de perfil se disponível
//         if (user.profileImage) {
//           setProfileImage(user.profileImage);
//         }
//       }
//     } catch (error) {
//       console.error('Erro ao carregar dados do usuário:', error);
//     }
//   };
  
//   // Redirecionar para login se não estiver autenticado
//   if (!isAuthenticated && !loading) {
//     return <Redirect href="/LoginScreen" />;
//   }
  
//   // Mostrar indicador de carregamento enquanto verifica autenticação
//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={theme.colors.primary} />
//         <Text style={styles.loadingText}>Carregando...</Text>
//       </View>
//     );
//   }

//   const recentWorkouts = workouts.slice(0, 3);
//   const workoutsCount = workouts.length;
//   const aiGeneratedCount = workouts.filter(workout => workout.isAIGenerated).length;

//   const menuItems = [
//     {
//       title: 'Meus Treinos',
//       icon: 'dumbbell',
//       color: theme.colors.primary,
//       route: '/WorkoutsScreen',
//       description: 'Acesse e gerencie seus treinos'
//     },
//     {
//       title: 'Gerar Treino com IA',
//       icon: 'robot',
//       color: theme.colors.secondary,
//       route: '/AnamneseFormScreen',
//       description: 'Crie um treino personalizado com IA'
//     },
//     {
//       title: 'Gerenciar Treinos',
//       icon: 'format-list-checks',
//       color: theme.colors.success,
//       route: '/ManageWorkoutsScreen',
//       description: 'Organize e edite seus treinos'
//     },
//     {
//       title: 'Meu Perfil',
//       icon: 'account',
//       color: theme.colors.warning,
//       route: '/ProfileScreen',
//       description: 'Edite suas informações pessoais'
//     },
//     {
//       title: 'Ajuda',
//       icon: 'help-circle',
//       color: theme.colors.info,
//       route: '/HelpScreen',
//       description: 'Dúvidas e instruções de uso'
//     }
//   ];

//   return (
//     <View style={styles.container}>
//       <ScrollView style={styles.scrollView}>
//         <View style={styles.header}>
//           <View style={styles.userInfo}>
//             <TouchableOpacity onPress={() => router.push('/ProfileScreen')}>
//               {profileImage ? (
//                 <Image source={{ uri: profileImage }} style={styles.profileImage} />
//               ) : (
//                 <View style={styles.profileImagePlaceholder}>
//                   <MaterialCommunityIcons name="account" size={30} color={theme.colors.white} />
//                 </View>
//               )}
//             </TouchableOpacity>
//             <View style={styles.welcomeText}>
//               <Text style={styles.greeting}>Olá, {userName || 'Atleta'}!</Text>
//               <Text style={styles.date}>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
//             </View>
//           </View>
//         </View>

//         <View style={styles.statsContainer}>
//           <View style={styles.statCard}>
//             <MaterialCommunityIcons name="dumbbell" size={24} color={theme.colors.primary} />
//             <Text style={styles.statValue}>{workoutsCount}</Text>
//             <Text style={styles.statLabel}>Treinos</Text>
//           </View>
//           <View style={styles.statCard}>
//             <MaterialCommunityIcons name="robot" size={24} color={theme.colors.secondary} />
//             <Text style={styles.statValue}>{aiGeneratedCount}</Text>
//             <Text style={styles.statLabel}>Gerados por IA</Text>
//           </View>
//         </View>

//         <Text style={styles.sectionTitle}>Menu Rápido</Text>
//         <View style={styles.menuGrid}>
//           {menuItems.map((item, index) => (
//             <TouchableOpacity
//               key={index}
//               style={styles.menuItem}
//               onPress={() => router.push(item.route)}
//             >
//               <View style={[styles.menuIconContainer, { backgroundColor: item.color }]}>
//                 <MaterialCommunityIcons name={item.icon} size={24} color={theme.colors.white} />
//               </View>
//               <Text style={styles.menuItemTitle}>{item.title}</Text>
//               <Text style={styles.menuItemDescription}>{item.description}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         {recentWorkouts.length > 0 && (
//           <>
//             <View style={styles.sectionHeader}>
//               <Text style={styles.sectionTitle}>Treinos Recentes</Text>
//               <TouchableOpacity onPress={() => router.push('/WorkoutsScreen')}>
//                 <Text style={styles.seeAllLink}>Ver todos</Text>
//               </TouchableOpacity>
//             </View>
//             <View style={styles.recentWorkouts}>
//               {recentWorkouts.map((workout, index) => (
//                 <TouchableOpacity
//                   key={workout.id}
//                   style={styles.recentWorkoutItem}
//                   onPress={() => router.push(`/WorkoutDetailsScreen?id=${workout.id}&mode=view`)}
//                 >
//                   <View style={styles.workoutHeader}>
//                     <Text style={styles.workoutTitle}>{workout.name}</Text>
//                     {workout.isAIGenerated && (
//                       <MaterialCommunityIcons name="robot" size={16} color={theme.colors.secondary} />
//                     )}
//                   </View>
//                   <Text style={styles.workoutDescription} numberOfLines={2}>
//                     {workout.description || 'Sem descrição'}
//                   </Text>
//                   <View style={styles.workoutDetails}>
//                     <View style={styles.workoutDetail}>
//                       <MaterialCommunityIcons name="dumbbell" size={14} color={theme.colors.secondary} />
//                       <Text style={styles.workoutDetailText}>
//                         {workout.exercises?.length || 0} exercícios
//                       </Text>
//                     </View>
//                   </View>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </>
//         )}
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: theme.colors.background,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   header: {
//     backgroundColor: theme.colors.primary,
//     padding: theme.spacing.lg,
//     paddingTop: theme.spacing.xl + 10,
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//     ...theme.shadows.medium,
//   },
//   userInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   profileImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     borderWidth: 2,
//     borderColor: theme.colors.white,
//   },
//   profileImagePlaceholder: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: theme.colors.primaryDark,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: theme.colors.white,
//   },
//   welcomeText: {
//     marginLeft: theme.spacing.md,
//   },
//   greeting: {
//     ...theme.typography.h2,
//     color: theme.colors.white,
//   },
//   date: {
//     ...theme.typography.body,
//     color: theme.colors.white,
//     opacity: 0.8,
//   },
//   statsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginTop: -30,
//     marginHorizontal: theme.spacing.lg,
//     marginBottom: theme.spacing.lg,
//   },
//   statCard: {
//     backgroundColor: theme.colors.surface,
//     borderRadius: theme.borderRadius.md,
//     padding: theme.spacing.md,
//     alignItems: 'center',
//     minWidth: 120,
//     ...theme.shadows.small,
//   },
//   statValue: {
//     ...theme.typography.h1,
//     color: theme.colors.text,
//     marginVertical: theme.spacing.xs,
//   },
//   statLabel: {
//     ...theme.typography.caption,
//     color: theme.colors.textSecondary,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: theme.spacing.lg,
//     marginTop: theme.spacing.lg,
//     marginBottom: theme.spacing.md,
//   },
//   sectionTitle: {
//     ...theme.typography.h2,
//     color: theme.colors.text,
//     paddingHorizontal: theme.spacing.lg,
//     marginTop: theme.spacing.lg,
//     marginBottom: theme.spacing.md,
//   },
//   seeAllLink: {
//     ...theme.typography.body,
//     color: theme.colors.primary,
//   },
//   menuGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//     paddingHorizontal: theme.spacing.lg,
//   },
//   menuItem: {
//     backgroundColor: theme.colors.surface,
//     borderRadius: theme.borderRadius.md,
//     padding: theme.spacing.md,
//     marginBottom: theme.spacing.md,
//     width: '48%',
//     ...theme.shadows.small,
//   },
//   menuIconContainer: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: theme.spacing.sm,
//   },
//   menuItemTitle: {
//     ...theme.typography.subtitle,
//     color: theme.colors.text,
//     marginBottom: theme.spacing.xs,
//   },
//   menuItemDescription: {
//     ...theme.typography.caption,
//     color: theme.colors.textSecondary,
//   },
//   recentWorkouts: {
//     paddingHorizontal: theme.spacing.lg,
//   },
//   recentWorkoutItem: {
//     backgroundColor: theme.colors.surface,
//     borderRadius: theme.borderRadius.md,
//     padding: theme.spacing.md,
//     marginBottom: theme.spacing.md,
//     ...theme.shadows.small,
//   },
//   workoutHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: theme.spacing.xs,
//   },
//   workoutTitle: {
//     ...theme.typography.subtitle,
//     color: theme.colors.text,
//     flex: 1,
//   },
//   workoutDescription: {
//     ...theme.typography.body,
//     color: theme.colors.textSecondary,
//     marginBottom: theme.spacing.xs,
//     fontSize: 12,
//   },
//   workoutDetails: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   workoutDetail: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   workoutDetailText: {
//     ...theme.typography.caption,
//     color: theme.colors.textSecondary,
//     marginLeft: theme.spacing.xs,
//     fontSize: 11,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     ...theme.typography.body,
//     color: theme.colors.text,
//     marginTop: theme.spacing.sm,
//   },
// });
