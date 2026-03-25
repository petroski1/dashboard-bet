import type { YouTubeVideo, Niche, VideoCategory, AIRecommendation } from '../types';
import { CATEGORY_EMOJIS, CPM_ESTIMATES } from '../utils/mockData';

export function buildNiches(videos: YouTubeVideo[]): Niche[] {
  const byCategory = new Map<VideoCategory, YouTubeVideo[]>();

  for (const v of videos) {
    const list = byCategory.get(v.category) ?? [];
    list.push(v);
    byCategory.set(v.category, list);
  }

  const niches: Niche[] = [];

  byCategory.forEach((catVideos, category) => {
    const totalViews = catVideos.reduce((s, v) => s + v.viewCount, 0);
    const avgEngagement = parseFloat(
      (catVideos.reduce((s, v) => s + v.engagementRate, 0) / catVideos.length).toFixed(2)
    );
    const avgViewsPerHour = parseFloat(
      (catVideos.reduce((s, v) => s + v.viewsPerHour, 0) / catVideos.length).toFixed(0)
    );
    const shortCount = catVideos.filter((v) => v.type === 'short').length;
    const longCount = catVideos.filter((v) => v.type === 'long').length;

    const topVideo = catVideos.reduce((best, v) => (v.growthScore > best.growthScore ? v : best));

    const cpm = CPM_ESTIMATES[category] ?? 8;

    // Scores 0–100
    const viewScore = Math.min(100, (totalViews / 10_000_000) * 40);
    const engagementScore = Math.min(100, avgEngagement * 15);
    const velocityScore = Math.min(100, (avgViewsPerHour / 500_000) * 40);
    const growthScore = parseFloat((viewScore * 0.35 + engagementScore * 0.35 + velocityScore * 0.3).toFixed(1));

    const monetizationScore = parseFloat(
      Math.min(100, (cpm / 25) * 50 + avgEngagement * 10 + (totalViews / 5_000_000) * 20).toFixed(1)
    );
    const viralPotential = parseFloat(
      Math.min(100, (avgViewsPerHour / 200_000) * 40 + avgEngagement * 8 + (shortCount / Math.max(catVideos.length, 1)) * 25).toFixed(1)
    );

    // Trend: simulate based on recency
    const avgHoursAgo = catVideos.reduce((s, v) => s + v.hoursAgo, 0) / catVideos.length;
    const trendDirection: 'up' | 'down' | 'stable' =
      avgHoursAgo < 10 ? 'up' : avgHoursAgo > 30 ? 'down' : 'stable';
    const trendPercent = parseFloat(
      (trendDirection === 'up' ? 15 + Math.random() * 85 : trendDirection === 'down' ? -(10 + Math.random() * 20) : Math.random() * 10).toFixed(1)
    );

    const descriptions: Record<string, string> = {
      Gaming: 'Conteúdo de jogos cresce explosivamente com Shorts. Audiência jovem e altamente engajada.',
      Music: 'Músicas virais e reações dominam as tendências. CPM médio mas alcance massivo.',
      Technology: 'IA e gadgets atraem audiência premium com alto CPM. Crescimento constante.',
      Finance: 'Nicho com maior CPM do YouTube. Audiência de alta renda, altamente fiel.',
      Fitness: 'Shorts de treino viralizam rápido. Monetização com afiliados é forte.',
      Lifestyle: 'Rotinas, produtividade e riqueza geram grande engajamento e fidelidade.',
      Education: 'Cursos e tutoriais têm retenção alta e CPM elevado. Crescimento sustentável.',
      Entertainment: 'Celebridades e reality shows geram picos virais massivos.',
      News: 'Notícias quebram em Shorts. Alto volume, monetização moderada.',
      Food: 'Receitas e reviews viralizam fácil. Patrocínios com marcas de alimentos são lucrativos.',
      Travel: 'Conteúdo aspiracional com alto engajamento e CPM acima da média.',
      Beauty: 'Tutoriais de maquiagem têm CPM elevado com patrocínios de marcas premium.',
      Sports: 'Momentos virais e reações geram picos de visualizações massivos.',
      Science: 'Curiosidades científicas viralizam em Shorts com audiência educada e premium.',
      Comedy: 'O formato mais viral do YouTube. Shorts de comédia explodem em horas.',
    };

    niches.push({
      id: category.toLowerCase(),
      name: category,
      emoji: CATEGORY_EMOJIS[category],
      totalViews,
      avgEngagement,
      videoCount: catVideos.length,
      shortCount,
      longCount,
      growthScore,
      monetizationScore,
      viralPotential,
      avgViewsPerHour,
      topVideo,
      cpmEstimate: cpm,
      trendDirection,
      trendPercent,
      description: descriptions[category] ?? '',
      tags: catVideos.flatMap((v) => v.tags).slice(0, 6),
    });
  });

  return niches.sort((a, b) => b.growthScore - a.growthScore);
}

export function generateAIRecommendation(niches: Niche[], _videos: YouTubeVideo[]): AIRecommendation {
  // Score combining growth, monetization, viral potential, and low competition
  const scored = niches.map((n) => ({
    niche: n,
    score: n.growthScore * 0.35 + n.monetizationScore * 0.35 + n.viralPotential * 0.2 + (100 - n.videoCount * 5) * 0.1,
  }));

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0].niche;

  const cpm = best.cpmEstimate;
  const estimatedMonthlyViews = best.avgViewsPerHour * 24 * 30;
  const minEarnings = Math.floor((estimatedMonthlyViews / 1000) * cpm * 0.4);
  const maxEarnings = Math.floor((estimatedMonthlyViews / 1000) * cpm * 1.2);

  const competitionMap: Record<string, 'low' | 'medium' | 'high'> = {
    Comedy: 'high',
    Music: 'high',
    Gaming: 'high',
    Sports: 'medium',
    Entertainment: 'medium',
    Food: 'medium',
    Finance: 'low',
    Technology: 'medium',
    Science: 'low',
    Education: 'low',
    Fitness: 'medium',
    Travel: 'low',
    Beauty: 'medium',
    Lifestyle: 'medium',
    News: 'high',
  };

  const contentIdeasMap: Record<string, string[]> = {
    Finance: [
      'Como investir R$100 por mês e ficar rico',
      'Segredos que bancos não querem que você saiba',
      'Análise ao vivo do mercado de ações',
      'Erros que destroem sua carteira de investimentos',
      'A estratégia que fundos usam mas não divulgam',
    ],
    Technology: [
      'IA que vai substituir seu trabalho em 2025',
      'Review do produto mais viral da semana',
      'Como usar ChatGPT para ganhar dinheiro',
      'Gadgets baratos que parecem caros',
      'Fiz uma startup com IA em 7 dias',
    ],
    Science: [
      'O fenômeno impossível descoberto no oceano',
      'Fatos do universo que vão explodir sua mente',
      'Experimento científico que deu errado (e deu viral)',
      'Por que o céu não é azul de verdade',
      'O ser mais estranho descoberto recentemente',
    ],
    Fitness: [
      'Treino de 7 minutos que muda seu corpo',
      'Por que você não perde peso (a verdade)',
      'Rotina de atleta olímpico adaptada para iniciantes',
      'O erro fatal que 90% faz na academia',
      'Transformação em 30 dias sem academia',
    ],
    Education: [
      'Aprenda Python do zero em 1 hora',
      'O método de estudos usado por gênios',
      'Habilidade que vale mais que qualquer faculdade',
      'Como memorizar qualquer coisa em minutos',
      'O curso mais valioso que ninguém te conta',
    ],
  };

  const ideas = contentIdeasMap[best.name] ?? [
    `Os ${best.name} mais virais de 2025`,
    `Segredos do nicho de ${best.name} revelados`,
    `Como monetizar ${best.name} do zero`,
    `A fórmula de ${best.name} que está explodindo`,
    `Reação aos vídeos mais virais de ${best.name}`,
  ];

  const reasonMap: Record<string, string> = {
    Finance: `O nicho Financeiro tem o maior CPM do YouTube (R$${cpm * 5}–R$${cpm * 7}/mil views) e sua audiência cresce ${best.trendPercent.toFixed(0)}% nas últimas 48h. Combinando vídeos longos educativos com Shorts de "dica rápida", o potencial de monetização é excepcional.`,
    Technology: `Tecnologia e IA dominam as tendências com engajamento ${best.avgEngagement.toFixed(1)}% acima da média. O público premium atrai anunciantes de alto valor, e novos lançamentos garantem conteúdo constante.`,
    Science: `Ciência em formato Short está explodindo: ${best.avgViewsPerHour.toLocaleString()} visualizações/hora em média. Audiência educada com alto CPM e baixa saturação de criadores = oportunidade ideal agora.`,
    Fitness: `Fitness shorts viralizam em média ${best.viralPotential.toFixed(0)}/100 pontos de viral. Audiência fiel, afiliados lucrativos e crescimento ${best.trendPercent.toFixed(0)}% nas últimas 48h.`,
    Comedy: `Comédia é o formato mais viral: ${best.avgViewsPerHour.toLocaleString()} views/hora. Shorts de humor explodem em 1–6h e o algoritmo favorece massivamente este nicho agora.`,
  };

  const reason =
    reasonMap[best.name] ??
    `${best.emoji} ${best.name} apresenta crescimento de ${best.trendPercent.toFixed(0)}% nas últimas 48h com taxa de engajamento de ${best.avgEngagement.toFixed(1)}% e ${best.avgViewsPerHour.toLocaleString()} visualizações por hora. Score de monetização: ${best.monetizationScore.toFixed(0)}/100.`;

  const competition = competitionMap[best.name] ?? 'medium';
  const timeMap = { low: '2–3 meses', medium: '3–5 meses', high: '5–8 meses' };
  const bestTypeMap: Record<string, 'short' | 'long' | 'both'> = {
    Comedy: 'short',
    News: 'short',
    Science: 'short',
    Gaming: 'both',
    Finance: 'long',
    Education: 'both',
    Technology: 'both',
    Fitness: 'short',
    Music: 'short',
    Lifestyle: 'both',
    Beauty: 'long',
    Sports: 'short',
    Food: 'long',
    Travel: 'long',
    Entertainment: 'both',
  };

  return {
    niche: best,
    reason,
    confidence: parseFloat(Math.min(99, 70 + best.growthScore * 0.3).toFixed(0)),
    estimatedMonthlyEarnings: { min: minEarnings, max: maxEarnings },
    bestVideoType: bestTypeMap[best.name] ?? 'both',
    contentIdeas: ideas,
    competitionLevel: competition,
    timeToMonetize: timeMap[competition],
  };
}

export function getGrowthChartData(videos: YouTubeVideo[]) {
  const hours = Array.from({ length: 12 }, (_, i) => i * 4);
  const categories = [...new Set(videos.map((v) => v.category))].slice(0, 4);

  return hours.map((h) => {
    const point: Record<string, number | string> = { hour: `${h}h` };
    for (const cat of categories) {
      const relevant = videos.filter((v) => v.category === cat && v.hoursAgo <= h + 4);
      point[cat] = relevant.reduce((s, v) => s + v.viewCount, 0);
    }
    return point;
  });
}
