import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { JobPostingService } from '../services/job-posting.service';

export class JobPostingController {
  private jobPostingService: JobPostingService;

  constructor() {
    this.jobPostingService = new JobPostingService();
  }

  /**
   * 求人を作成
   */
  createJobPosting = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user || req.user.userType !== 'pharmacy') {
        return res.status(403).json({
          success: false,
          error: '薬局アカウントのみアクセス可能です',
        });
      }

      const pharmacyId = BigInt(req.body.pharmacyId);
      const jobPosting = await this.jobPostingService.createJobPosting({
        pharmacyId,
        title: req.body.title,
        workLocation: req.body.workLocation,
        description: req.body.description,
        desiredWorkDays: req.body.desiredWorkDays,
        workStartPeriodFrom: req.body.workStartPeriodFrom ? new Date(req.body.workStartPeriodFrom) : new Date(),
        workStartPeriodTo: req.body.workStartPeriodTo ? new Date(req.body.workStartPeriodTo) : new Date(),
        recruitmentDeadline: req.body.recruitmentDeadline ? new Date(req.body.recruitmentDeadline) : new Date(),
        requirements: req.body.requirements,
        desiredWorkHours: req.body.desiredWorkHours,
        dailyWage: req.body.dailyWage,
        totalCompensation: req.body.totalCompensation,
        platformFee: req.body.platformFee,
        status: req.body.status === 'published' ? 'published' : 'draft',
      });

      return res.status(201).json({
        success: true,
        message: '求人を作成しました',
        data: jobPosting,
      });
    } catch (error: any) {
      console.error('Create job posting error:', error);
      return res.status(400).json({
        success: false,
        error: error.message || '求人の作成に失敗しました',
      });
    }
  };

  /**
   * 求人を更新
   */
  updateJobPosting = async (req: AuthRequest, res: Response) => {
    try {
      const jobPostingId = BigInt(req.params.id);
      const jobPosting = await this.jobPostingService.updateJobPosting(
        jobPostingId,
        req.body
      );

      return res.status(200).json({
        success: true,
        message: '求人を更新しました',
        data: jobPosting,
      });
    } catch (error: any) {
      console.error('Update job posting error:', error);
      return res.status(400).json({
        success: false,
        error: error.message || '求人の更新に失敗しました',
      });
    }
  };

  /**
   * 求人を削除
   */
  deleteJobPosting = async (req: AuthRequest, res: Response) => {
    try {
      const jobPostingId = BigInt(req.params.id);
      await this.jobPostingService.deleteJobPosting(jobPostingId);

      return res.status(200).json({
        success: true,
        message: '求人を削除しました',
      });
    } catch (error: any) {
      console.error('Delete job posting error:', error);
      return res.status(400).json({
        success: false,
        error: error.message || '求人の削除に失敗しました',
      });
    }
  };

  /**
   * 求人を公開
   */
  publishJobPosting = async (req: AuthRequest, res: Response) => {
    try {
      const jobPostingId = BigInt(req.params.id);
      const result = await this.jobPostingService.publishJobPosting(jobPostingId);

      return res.status(200).json({
        success: true,
        message: '求人を公開しました',
        data: result,
      });
    } catch (error: any) {
      console.error('Publish job posting error:', error);
      return res.status(400).json({
        success: false,
        error: error.message || '求人の公開に失敗しました',
      });
    }
  };

  /**
   * 求人を非公開
   */
  unpublishJobPosting = async (req: AuthRequest, res: Response) => {
    try {
      const jobPostingId = BigInt(req.params.id);
      const result = await this.jobPostingService.unpublishJobPosting(jobPostingId);

      return res.status(200).json({
        success: true,
        message: '求人を非公開にしました',
        data: result,
      });
    } catch (error: any) {
      console.error('Unpublish job posting error:', error);
      return res.status(400).json({
        success: false,
        error: error.message || '求人の非公開化に失敗しました',
      });
    }
  };

  /**
   * 求人詳細を取得
   */
  getJobPosting = async (req: AuthRequest, res: Response) => {
    try {
      const jobPostingId = BigInt(req.params.id);
      const jobPosting = await this.jobPostingService.getJobPosting(jobPostingId);

      return res.status(200).json({
        success: true,
        data: jobPosting,
      });
    } catch (error: any) {
      console.error('Get job posting error:', error);
      return res.status(404).json({
        success: false,
        error: error.message || '求人が見つかりません',
      });
    }
  };

  /**
   * 薬局の求人一覧を取得
   */
  getPharmacyJobPostings = async (req: AuthRequest, res: Response) => {
    try {
      const pharmacyId = BigInt(req.params.pharmacyId);
      const jobPostings = await this.jobPostingService.getPharmacyJobPostings(
        pharmacyId
      );

      return res.status(200).json({
        success: true,
        data: jobPostings,
      });
    } catch (error: any) {
      console.error('Get pharmacy job postings error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || '求人一覧の取得に失敗しました',
      });
    }
  };

  /**
   * 求人を検索
   */
  searchJobPostings = async (req: AuthRequest, res: Response) => {
    try {
      const {
        prefecture,
        minWage,
        maxWage,
        status,
        keyword,
        page,
        limit,
      } = req.query;

      const result = await this.jobPostingService.searchJobPostings({
        prefecture: prefecture as string,
        minWage: minWage ? Number(minWage) : undefined,
        maxWage: maxWage ? Number(maxWage) : undefined,
        status: status as string,
        keyword: keyword as string,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error: any) {
      console.error('Search job postings error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || '求人検索に失敗しました',
      });
    }
  };
}

