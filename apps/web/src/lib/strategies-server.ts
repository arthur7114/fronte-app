import "server-only"

import type { Tables } from "@super/db"
import {
  listStrategiesForTenant,
  getStrategyForTenant,
  listKeywordCandidatesForTenant,
  listTopicCandidatesForTenant,
  listContentBriefsForTenant,
  listPostsForTenant
} from "./automation-data"
import {
  adaptStrategy,
  adaptPost,
  type Strategy,
  type ArticleItem,
} from "./strategies"

// ============================================
// Strategy DB methods
// ============================================

export async function listStrategiesFromDb(tenantId: string): Promise<Strategy[]> {
  const strategies = await listStrategiesForTenant(tenantId)
  return strategies.map(adaptStrategy)
}

export async function getStrategyFromDb(tenantId: string, id: string): Promise<Strategy | undefined> {
  const str = await getStrategyForTenant(tenantId, id)
  if (!str) return undefined
  return adaptStrategy(str)
}

export async function getStrategyStatsFromDb(tenantId: string, strategyId: string) {
  const [keywords, topics, briefs, posts] = await Promise.all([
    listKeywordCandidatesForTenant(tenantId, strategyId),
    listTopicCandidatesForTenant(tenantId).then(res => res.filter(t => t.strategy_id === strategyId)),
    listContentBriefsForTenant(tenantId),
    listPostsForTenant(tenantId),
  ])
  const strategyBriefs = briefs.filter(b => (b as any).strategy_id === strategyId)
  const strategyPosts = posts.filter(p => p.strategy_id === strategyId)
  return {
    keywords: keywords.length,
    topics: topics.length,
    articles: strategyPosts.length || strategyBriefs.length,
    inProduction: strategyBriefs.filter(b => b.status === 'in_progress').length,
    published: strategyPosts.filter(p => p.status === 'published').length || strategyBriefs.filter(b => b.status === 'completed').length,
    drafts: strategyPosts.filter(p => p.status === 'draft').length || strategyBriefs.filter(b => b.status === 'pending').length,
    scheduled: strategyPosts.filter(p => p.status === 'scheduled').length,
  }
}

// ============================================
// Articles DB methods
// ============================================

export async function listArticlesFromDb(tenantId: string, strategyId?: string): Promise<ArticleItem[]> {
  const posts = await listPostsForTenant(tenantId)
  const filtered = strategyId
    ? posts.filter(p => p.strategy_id === strategyId)
    : posts
  return filtered.map(adaptPost)
}

export async function countPostsForStrategyFromDb(tenantId: string, strategyId: string): Promise<number> {
  const posts = await listPostsForTenant(tenantId)
  return posts.filter((post) => post.strategy_id === strategyId).length
}

export async function getArticleStatsFromDb(tenantId: string) {
  const posts = await listPostsForTenant(tenantId)
  return {
    total: posts.length,
    published: posts.filter(p => p.status === "published").length,
    drafts: posts.filter(p => p.status === "draft").length,
    inReview: posts.filter(p => p.status === "in_review").length,
    scheduled: posts.filter(p => p.status === "scheduled").length,
  }
}
