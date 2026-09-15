import { db } from '../db/init.js'
import { v4 as uuidv4 } from 'uuid'

export interface RouteAnalysis {
  id: string
  routeId: string
  lighting: string
  crowdActivity: string
  isolation: string
  nearbyHelpPoints: number
  communityReports: number
  safetyScore: number
  preferencesMatch: number
  recommendationReason: string
  createdAt: string
}

export async function analyzeRouteSafety(
  routeId: string,
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  distance: number,
  duration: number
): Promise<RouteAnalysis> {
  const analysisId = uuidv4()
  const now = new Date().toISOString()

  // Deterministic fallback scoring system based on available data
  // In production, this would integrate with real mapping/AI services

  const score = calculateSafetyScore(distance, duration, origin, destination)
  const lighting = getEstimatedLighting()
  const crowdActivity = getEstimatedCrowd(distance)
  const isolation = getEstimatedIsolation(origin, destination)
  const helpPoints = await getNearbyHelpPoints(origin, destination)
  const reports = await getNearbyReports(origin, destination)
  const preferencesMatch = 75 // Default
  const reason = generateRecommendation(score, lighting, isolation)

  await db.run(
    `INSERT INTO route_analysis (id, route_id, lighting, crowd_activity, isolation, nearby_help_points, community_reports, safety_score, preferences_match, recommendation_reason, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [analysisId, routeId, lighting, crowdActivity, isolation, helpPoints, reports, score, preferencesMatch, reason, now]
  )

  return {
    id: analysisId,
    routeId,
    lighting,
    crowdActivity,
    isolation,
    nearbyHelpPoints: helpPoints,
    communityReports: reports,
    safetyScore: score,
    preferencesMatch,
    recommendationReason: reason,
    createdAt: now,
  }
}

function calculateSafetyScore(distance: number, duration: number, origin: any, destination: any): number {
  // Base score
  let score = 70

  // Distance factor (shorter is safer)
  if (distance < 5) score += 15
  else if (distance < 10) score += 10
  else if (distance > 30) score -= 10

  // Duration factor (faster is safer in many cases)
  if (duration < 30) score += 10
  else if (duration > 90) score -= 5

  // Clamp to 0-100
  return Math.max(0, Math.min(100, score))
}

function getEstimatedLighting(): string {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 18) return 'well-lit'
  if (hour >= 18 && hour < 20) return 'twilight'
  return 'dark'
}

function getEstimatedCrowd(distance: number): string {
  if (distance < 3) return 'moderate'
  if (distance < 10) return 'light'
  return 'varies'
}

function getEstimatedIsolation(origin: any, destination: any): string {
  // Simple distance-based heuristic
  return 'moderate'
}

async function getNearbyHelpPoints(origin: any, destination: any): Promise<number> {
  // TODO: Integrate with actual geospatial query or service
  return 3 // Mock data
}

async function getNearbyReports(origin: any, destination: any): Promise<number> {
  // TODO: Query community reports near route
  return 0 // Mock data
}

function generateRecommendation(score: number, lighting: string, isolation: string): string {
  if (score >= 80) return 'This route is well-established and generally safe.'
  if (score >= 60) return 'This route is reasonably safe with some precautions.'
  return 'Consider alternative routes with better safety metrics.'
}

export async function getRouteAnalysis(routeId: string): Promise<RouteAnalysis | null> {
  const row = await db.get(
    `SELECT id, route_id, lighting, crowd_activity, isolation, nearby_help_points, community_reports, safety_score, preferences_match, recommendation_reason, created_at
     FROM route_analysis WHERE route_id = ?`,
    [routeId]
  )

  if (!row) return null

  return {
    id: row.id,
    routeId: row.route_id,
    lighting: row.lighting,
    crowdActivity: row.crowd_activity,
    isolation: row.isolation,
    nearbyHelpPoints: row.nearby_help_points,
    communityReports: row.community_reports,
    safetyScore: row.safety_score,
    preferencesMatch: row.preferences_match,
    recommendationReason: row.recommendation_reason,
    createdAt: row.created_at,
  }
}
