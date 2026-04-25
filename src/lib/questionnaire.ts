import type { DimensionDefinition, Question } from "@/lib/types";

export const SCALE_OPTIONS = [
  { value: 1, label: "完全不符合" },
  { value: 2, label: "比较不符合" },
  { value: 3, label: "不确定" },
  { value: 4, label: "比较符合" },
  { value: 5, label: "完全符合" }
] as const;

export const DIMENSIONS: DimensionDefinition[] = [
  {
    id: "motivation",
    code: "M",
    name: "错失动机",
    englishName: "Missing Motivation",
    shortName: "动机",
    description: "归属需要、社交认同等内在心理动机。",
    lowFeedback: "你对社交归属的即时确认需求较低，通常不会刻意关注自己是否被朋友时刻圈在内。",
    mediumFeedback: "你会在意朋友间的社交连接，但整体仍能在多数情境中保持弹性。",
    highFeedback: "你很需要归属感，害怕被朋友排除在外，朋友的活动对你来说具有较强的接纳意义。"
  },
  {
    id: "cognition",
    code: "C",
    name: "错失认知",
    englishName: "Missing Cognition",
    shortName: "认知",
    description: "关于他人有更好体验的信念和上行社会比较。",
    lowFeedback: "你比较少和他人比较，能相对理性地看待社交媒体上的精彩人生。",
    mediumFeedback: "你偶尔会把自己的状态与他人比较，需要留意社交媒体带来的片面印象。",
    highFeedback: "你常觉得别人的生活比自己精彩，也容易认为自己错过了很多重要机会。"
  },
  {
    id: "emotion",
    code: "E",
    name: "错失情绪",
    englishName: "Missing Emotion",
    shortName: "情绪",
    description: "焦虑、不安、嫉妒、后悔和失落等负性体验。",
    lowFeedback: "你情绪较平稳，看到朋友分享快乐时通常能保持松弛，较少被怕错过牵动。",
    mediumFeedback: "你会在特定情境中感到不安或失落，但这种情绪并非持续占据主导。",
    highFeedback: "看到朋友玩得开心或错过重要信息时，你容易感到焦虑、不舒服、后悔或失落。"
  },
  {
    id: "behavior",
    code: "B",
    name: "错失行为",
    englishName: "Missing Behavior",
    shortName: "行为",
    description: "为缓解 FoMO 而采取的检查、分享和补偿行为。",
    lowFeedback: "你能控制查看手机和社交媒体的冲动，不太容易被怕错过牵着走。",
    mediumFeedback: "你有一定检查社交动态的习惯，但多数时候还能根据场景进行控制。",
    highFeedback: "你会频繁查看手机或社交媒体，即使在忙、睡前或醒来后也较难忍住。"
  }
];

export const QUESTIONS: Question[] = [
  {
    id: "M1",
    dimensionId: "motivation",
    text: "对我来说，在社交媒体上不被朋友们排除在外是一件非常重要的事",
    core: "不被朋友排除在外的重要性"
  },
  {
    id: "M2",
    dimensionId: "motivation",
    text: "我需要时刻在社交媒体上了解朋友们在做什么，否则会感到不踏实",
    core: "需要时刻了解朋友动态"
  },
  {
    id: "M3",
    dimensionId: "motivation",
    text: "如果我错过了朋友间的热门话题，我会觉得自己被边缘化了",
    core: "错过热门话题导致被边缘化"
  },
  {
    id: "M4",
    dimensionId: "motivation",
    text: "参与朋友们的活动对我来说意味着被接纳和认可",
    core: "参与活动等于被认可接纳"
  },
  {
    id: "C1",
    dimensionId: "cognition",
    text: "当我刷到朋友们在朋友圈/社交媒体上发布的信息，我觉得别人的生活比我精彩得多",
    core: "认为别人的生活更精彩"
  },
  {
    id: "C2",
    dimensionId: "cognition",
    text: "看到好友发了 ta 们的合照，我担心朋友们在我不在场时获得了更好的体验",
    core: "担心朋友在没有自己时有更好的体验"
  },
  {
    id: "C3",
    dimensionId: "cognition",
    text: "当我看到朋友们在朋友圈/社交媒体上分享的快乐时光时，会不自觉地拿自己和他们的生活作比较",
    core: "看到朋友分享时进行被动比较"
  },
  {
    id: "C4",
    dimensionId: "cognition",
    text: "我认为自己经常错过一些很重要的社交机会",
    core: "认为自己常错过重要社交机会"
  },
  {
    id: "E1",
    dimensionId: "emotion",
    text: "当我刷社交媒体时发现朋友们在我不在场的情况下玩得很开心时，我感到焦虑不安",
    core: "朋友开心时感到焦虑不安"
  },
  {
    id: "E2",
    dimensionId: "emotion",
    text: "看到别人比我过得精彩，我心里会感到不舒服",
    core: "别人更精彩时感到不舒服"
  },
  {
    id: "E3",
    dimensionId: "emotion",
    text: "当我没有及时刷到朋友们的最新动态时，我会产生一种莫名的烦躁感",
    core: "不知朋友动态产生烦躁感"
  },
  {
    id: "E4",
    dimensionId: "emotion",
    text: "错过与朋友们的重要信息后，我会持续感到后悔和失落",
    core: "错过重要消息后感到后悔失落"
  },
  {
    id: "B1",
    dimensionId: "behavior",
    text: "我会频繁查看手机/社交媒体，以防错过朋友们的动态",
    core: "频繁查看手机或社交媒体"
  },
  {
    id: "B2",
    dimensionId: "behavior",
    text: "即使在做正事，如上课、自习，我也会忍不住查看朋友们的最新消息",
    core: "正事中忍不住看手机"
  },
  {
    id: "B3",
    dimensionId: "behavior",
    text: "我会主动分享自己的动态，以确保不被朋友们“遗忘”",
    core: "主动分享动态防止被遗忘"
  },
  {
    id: "B4",
    dimensionId: "behavior",
    text: "我会在睡前或醒来后第一时间检查社交媒体上的信息更新",
    core: "睡前或醒后第一时间检查更新"
  }
];

export const QUESTION_IDS = QUESTIONS.map((question) => question.id);
