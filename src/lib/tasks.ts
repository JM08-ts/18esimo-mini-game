import { TaskConfig } from '../types';

export const GAME_TASKS: TaskConfig[] = [
  {
    id: 1,
    title: "Selfie con il Boss",
    description: "Scatta un selfie di te insieme al festeggiato",
    points: 10,
    maxSubmissions: 1,
    maxTotalPoints: 10
  },
  {
    id: 2,
    title: "Selfie di gruppo",
    description: "Scatta una foto di gruppo insieme al festeggiato (minimo 3 persone)",
    points: 10,
    maxSubmissions: 1,
    maxTotalPoints: 10
  },
  {
    id: 3,
    title: "Un drink con il Boss!",
    description: "Scatta una foto insieme al festeggiato mentre almeno uno dei due beve un drink",
    points: 10,
    maxSubmissions: 1,
    maxTotalPoints: 10
  },
  {
    id: 4,
    title: "Re della Pista",
    description: "Scatta una foto a qualcuno mentre balla scatenato in pista",
    points: 10,
    maxSubmissions: 1,
    maxTotalPoints: 10
  },
  {
    id: 5,
    title: "Momento Torta",
    description: "Scatta una foto intera del festeggiato al momento della torta",
    points: 10,
    maxSubmissions: 1,
    maxTotalPoints: 10
  },
  {
    id: 6,
    title: "Scatto Libero",
    description: "Carica le tue foto più belle e divertenti della serata! (5 punti a foto, fino a 10 foto)",
    points: 5,
    maxSubmissions: 10,
    maxTotalPoints: 50
  }
];

export const TOTAL_GOAL_POINTS = 100;
