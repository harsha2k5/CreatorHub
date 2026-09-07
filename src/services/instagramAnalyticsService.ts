/**
 * Instagram Analytics Service
 * 
 * This service provides a clean abstraction layer for all Instagram Analytics data.
 * Currently, it delegates to `DemoInstagramProvider`.
 * 
 * IN STAGE 2:
 * To switch to the real Meta/Instagram Graph API, simply swap `currentProvider`
 * with `MetaGraphApiProvider` — no UI component changes will be required!
 */

import { DemoInstagramProvider, IInstagramAnalyticsProvider } from './demoInstagramProvider';
import { LiveInstagramProvider } from './liveInstagramProvider';
import { api } from './api';
import {
  CompleteInstagramAnalyticsPayload,
  DemoInstagramProfile,
  InstagramOverviewMetrics,
  FollowerGrowthPoint,
  EngagementBreakdown,
  TopContentItem,
  AudienceDemographics,
  BestPostingTime,
  ContentTypeMetric,
  CreatorHubAIScore,
  AIInsight,
  BrandCollaborationReadiness
} from '../types/instagramAnalytics';

class InstagramAnalyticsService {
  private customProvider: IInstagramAnalyticsProvider | null = null;
  private forceDemoMode: boolean = false;

  /**
   * Set custom provider (useful for testing or manual override)
   */
  public setProvider(newProvider: IInstagramAnalyticsProvider | null) {
    this.customProvider = newProvider;
  }

  /**
   * Toggle between live connected and demo mode
   */
  public setDemoMode(forceDemo: boolean) {
    this.forceDemoMode = forceDemo;
  }

  /**
   * Determine active provider based on live backend connection status
   */
  private async resolveProvider(): Promise<IInstagramAnalyticsProvider> {
    if (this.customProvider) {
      return this.customProvider;
    }
    if (this.forceDemoMode) {
      return DemoInstagramProvider;
    }
    try {
      const status = await api.getInstagramStatus();
      if (status && status.success && status.is_connected && status.account) {
        return LiveInstagramProvider;
      }
    } catch {
      // Offline / guest mode -> fallback to Demo
    }
    return DemoInstagramProvider;
  }

  /**
   * Get active provider instance
   */
  public async getProvider(): Promise<IInstagramAnalyticsProvider> {
    return this.resolveProvider();
  }

  /**
   * Fetch complete payload for the Instagram AI Analytics dashboard
   */
  public async getCompleteAnalytics(): Promise<CompleteInstagramAnalyticsPayload> {
    const provider = await this.resolveProvider();
    return provider.getCompleteAnalytics();
  }

  /**
   * Fetch profile header info
   */
  public async getProfile(): Promise<DemoInstagramProfile> {
    const provider = await this.resolveProvider();
    return provider.getProfile();
  }

  /**
   * Fetch quick overview KPI cards
   */
  public async getOverviewMetrics(): Promise<InstagramOverviewMetrics> {
    const provider = await this.resolveProvider();
    return provider.getOverviewMetrics();
  }

  /**
   * Fetch time-series follower growth data
   */
  public async getFollowerGrowth(timeframe: '7d' | '30d' | '90d' | '1y'): Promise<FollowerGrowthPoint[]> {
    const provider = await this.resolveProvider();
    return provider.getFollowerGrowth(timeframe);
  }

  /**
   * Fetch deep-dive engagement breakdown
   */
  public async getEngagementBreakdown(): Promise<EngagementBreakdown> {
    const provider = await this.resolveProvider();
    return provider.getEngagementBreakdown();
  }

  /**
   * Fetch top performing content items
   */
  public async getTopContent(filter?: 'all' | 'reel' | 'post' | 'carousel'): Promise<TopContentItem[]> {
    const provider = await this.resolveProvider();
    return provider.getTopContent(filter);
  }

  /**
   * Fetch audience demographics (age, gender, geos, active hours)
   */
  public async getAudienceDemographics(): Promise<AudienceDemographics> {
    const provider = await this.resolveProvider();
    return provider.getAudienceDemographics();
  }

  /**
   * Fetch AI recommended best posting windows
   */
  public async getBestPostingTimes(): Promise<BestPostingTime[]> {
    const provider = await this.resolveProvider();
    return provider.getBestPostingTimes();
  }

  /**
   * Fetch format vs format comparison
   */
  public async getContentTypeComparison(): Promise<ContentTypeMetric[]> {
    const provider = await this.resolveProvider();
    return provider.getContentTypeComparison();
  }

  /**
   * Fetch 0-100 CreatorHub AI Score
   */
  public async getAIScore(): Promise<CreatorHubAIScore> {
    const provider = await this.resolveProvider();
    return provider.getAIScore();
  }

  /**
   * Fetch dynamically generated AI insights
   */
  public async getAIInsights(): Promise<AIInsight[]> {
    const provider = await this.resolveProvider();
    return provider.getAIInsights();
  }

  /**
   * Fetch Marketplace Brand Collaboration Readiness metrics
   */
  public async getBrandCollaborationReadiness(): Promise<BrandCollaborationReadiness> {
    const provider = await this.resolveProvider();
    return provider.getBrandCollaborationReadiness();
  }

  /**
   * Connect / disconnect Instagram account
   */
  public async toggleConnection(connected: boolean): Promise<boolean> {
    if (!connected) {
      try {
        await api.disconnectInstagram();
      } catch (err) {
        console.warn('Disconnect error:', err);
      }
      return DemoInstagramProvider.setConnectionStatus(false);
    }
    return DemoInstagramProvider.setConnectionStatus(true);
  }
}

export const instagramAnalyticsService = new InstagramAnalyticsService();

