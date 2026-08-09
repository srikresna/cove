// @ts-nocheck
import FiveWTwoH from './edgeless/5W2H.json';
import ConceptMap from './edgeless/ConceptMap.json';
import Flowchart from './edgeless/Flowchart.json';
import SMART from './edgeless/SMART.json';
import SWOT from './edgeless/SWOT.json';
import FourPMarketingMatrix from './edgeless/4PMarketingMatrix.json';
import Storyboard from './edgeless/Storyboard.json';
import UserJourneyMap from './edgeless/UserJourneyMap.json';
import BusinessProposal from './edgeless/BusinessProposal.json';
import DataAnalysis from './edgeless/DataAnalysis.json';
import SimplePresentation from './edgeless/SimplePresentation.json';
import FishboneDiagram from './edgeless/FishboneDiagram.json';
import GanttChart from './edgeless/GanttChart.json';
import MonthlyCalendar from './edgeless/MonthlyCalendar.json';
import ProjectPlanning from './edgeless/ProjectPlanning.json';
import ProjectTrackingKanban from './edgeless/ProjectTrackingKanban.json';

const templates = {
  'Brainstorming': [
    FiveWTwoH,
    ConceptMap,
    Flowchart,
    SMART,
    SWOT
  ],
  'Marketing': [
    FourPMarketingMatrix,
    Storyboard,
    UserJourneyMap
  ],
  'Presentation': [
    BusinessProposal,
    DataAnalysis,
    SimplePresentation
  ],
  'ProjectManagement': [
    FishboneDiagram,
    GanttChart,
    MonthlyCalendar,
    ProjectPlanning,
    ProjectTrackingKanban
  ]
}

function lcs(text1: string, text2: string) {
  const dp: number[][] = Array.from({ length: text1.length + 1 })
    .fill(null)
    .map(() => Array.from<number>({length: text2.length + 1}).fill(0));

  for (let i = 1; i <= text1.length; i++) {
    for (let j = 1; j <= text2.length; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp[text1.length][text2.length];
}

export const builtInTemplates = {
  list: async (category: string) => {
    // @ts-expect-error type should be asserted when using
    return templates[category] ?? []
  },

  categories: async () => {
    return Object.keys(templates)
  },

  search: async(query: string) => {
    const candidates: unknown[] = [];
    const cates = Object.keys(templates);

    query = query.toLowerCase();

    for(let cate of cates) {
      // @ts-expect-error type should be asserted when using
      const templatesOfCate = templates[cate];

      for(let temp of templatesOfCate) {
        if(lcs(query, temp.name.toLowerCase()) === query.length) {
          candidates.push(temp);
        }
      }
    }

    return candidates;
  },
}
