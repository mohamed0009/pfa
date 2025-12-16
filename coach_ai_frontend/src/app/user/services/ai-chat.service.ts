import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ChatMessage, Conversation } from '../models/user.interfaces';

@Injectable({
  providedIn: 'root'
})
export class AiChatService {
  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  public conversations$ = this.conversationsSubject.asObservable();

  private messagesCache: { [conversationId: string]: ChatMessage[] } = {};

  private mockConversations: Conversation[] = [
    {
      id: 'conv1',
      userId: 'user1',
      title: 'Introduction à JavaScript',
      lastMessage: 'Peux-tu m\'expliquer les closures ?',
      lastMessageDate: new Date('2025-12-13T10:30:00'),
      messagesCount: 12,
      isActive: true
    },
    {
      id: 'conv2',
      userId: 'user1',
      title: 'Projet React',
      lastMessage: 'Comment gérer le state avec Redux ?',
      lastMessageDate: new Date('2025-12-12T15:20:00'),
      messagesCount: 8,
      isActive: false
    },
    {
      id: 'conv3',
      userId: 'user1',
      title: 'Questions sur TypeScript',
      lastMessage: 'Quelle est la différence entre interface et type ?',
      lastMessageDate: new Date('2025-12-11T09:10:00'),
      messagesCount: 5,
      isActive: false
    }
  ];

  private mockMessages: ChatMessage[] = [
    {
      id: 'msg1',
      conversationId: 'conv1',
      sender: 'user',
      content: 'Bonjour ! Je ne comprends pas bien le concept de closures en JavaScript.',
      timestamp: new Date('2025-12-13T10:15:00'),
      type: 'text'
    },
    {
      id: 'msg2',
      conversationId: 'conv1',
      sender: 'ai',
      content: 'Bonjour Marie ! 👋 Je serais ravi de t\'expliquer les closures. Une closure est une fonction qui a accès aux variables de son scope parent, même après que la fonction parent ait terminé son exécution.',
      timestamp: new Date('2025-12-13T10:15:30'),
      type: 'text'
    },
    {
      id: 'msg3',
      conversationId: 'conv1',
      sender: 'ai',
      content: 'Voici un exemple simple :',
      timestamp: new Date('2025-12-13T10:15:35'),
      type: 'text'
    },
    {
      id: 'msg4',
      conversationId: 'conv1',
      sender: 'user',
      content: 'Peux-tu m\'expliquer les closures avec un cas pratique ?',
      timestamp: new Date('2025-12-13T10:30:00'),
      type: 'text'
    },
    {
      id: 'msg5',
      conversationId: 'conv1',
      sender: 'ai',
      content: 'Bien sûr ! Voici un exemple pratique : imaginez que vous créez un compteur privé...',
      timestamp: new Date('2025-12-13T10:30:15'),
      type: 'text',
      attachments: [
        {
          id: 'att1',
          type: 'link',
          title: 'Exercice : Créer un compteur avec closure',
          url: '/user/exercises/closure-counter'
        }
      ]
    }
  ];

  constructor() {
    this.conversationsSubject.next(this.mockConversations);
    this.messagesCache['conv1'] = this.mockMessages;
  }

  // Récupérer toutes les conversations
  getConversations(): Observable<Conversation[]> {
    return of(this.mockConversations).pipe(delay(300));
  }

  // Récupérer les messages d'une conversation
  getMessages(conversationId: string): Observable<ChatMessage[]> {
    const messages = this.messagesCache[conversationId] || [];
    return of(messages).pipe(delay(400));
  }

  // Envoyer un message
  sendMessage(conversationId: string, content: string): Observable<ChatMessage> {
    const userMessage: ChatMessage = {
      id: 'msg' + Date.now(),
      conversationId,
      sender: 'user',
      content,
      timestamp: new Date(),
      type: 'text'
    };

    // Ajouter le message de l'utilisateur
    if (!this.messagesCache[conversationId]) {
      this.messagesCache[conversationId] = [];
    }
    this.messagesCache[conversationId].push(userMessage);

    // Mettre à jour la conversation
    const conversation = this.mockConversations.find(c => c.id === conversationId);
    if (conversation) {
      conversation.lastMessage = content;
      conversation.lastMessageDate = new Date();
      conversation.messagesCount++;
      this.conversationsSubject.next([...this.mockConversations]);
    }

    // Simuler une réponse de l'IA après un délai
    setTimeout(() => {
      this.generateAIResponse(conversationId, content);
    }, 2000);

    return of(userMessage).pipe(delay(200));
  }

  // Générer une réponse IA (mock)
  private generateAIResponse(conversationId: string, userMessage: string): void {
    const aiResponses = [
      'Excellente question ! Laisse-moi t\'expliquer en détail...',
      'Je comprends ta difficulté. Voici une façon simple de voir les choses...',
      'C\'est un concept important. Pour mieux comprendre, essayons avec un exemple concret...',
      'Tu es sur la bonne voie ! Voici quelques points clés à retenir...',
      'Je te propose un exercice pour pratiquer ce concept. Es-tu prêt(e) ?'
    ];

    const aiMessage: ChatMessage = {
      id: 'ai_msg' + Date.now(),
      conversationId,
      sender: 'ai',
      content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
      timestamp: new Date(),
      type: 'text'
    };

    this.messagesCache[conversationId].push(aiMessage);

    // Mettre à jour la conversation
    const conversation = this.mockConversations.find(c => c.id === conversationId);
    if (conversation) {
      conversation.lastMessage = aiMessage.content;
      conversation.lastMessageDate = new Date();
      conversation.messagesCount++;
      this.conversationsSubject.next([...this.mockConversations]);
    }
  }

  // Créer une nouvelle conversation
  createConversation(title: string): Observable<Conversation> {
    const newConv: Conversation = {
      id: 'conv' + Date.now(),
      userId: 'user1',
      title,
      lastMessage: 'Nouvelle conversation',
      lastMessageDate: new Date(),
      messagesCount: 0,
      isActive: true
    };

    // Désactiver les autres conversations
    this.mockConversations.forEach(c => c.isActive = false);
    this.mockConversations.unshift(newConv);
    this.conversationsSubject.next([...this.mockConversations]);

    return of(newConv).pipe(delay(300));
  }

  // Activer une conversation
  setActiveConversation(conversationId: string): Observable<boolean> {
    this.mockConversations.forEach(c => c.isActive = c.id === conversationId);
    this.conversationsSubject.next([...this.mockConversations]);
    return of(true).pipe(delay(100));
  }

  // Supprimer une conversation
  deleteConversation(conversationId: string): Observable<boolean> {
    const index = this.mockConversations.findIndex(c => c.id === conversationId);
    if (index !== -1) {
      this.mockConversations.splice(index, 1);
      delete this.messagesCache[conversationId];
      this.conversationsSubject.next([...this.mockConversations]);
    }
    return of(true).pipe(delay(200));
  }
}




