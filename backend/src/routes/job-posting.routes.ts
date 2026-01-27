import { Router } from 'express';
import { authenticate, requireUserType } from '../middleware/auth';
import { JobPostingController } from '../controllers/job-posting.controller';

const router = Router();
const jobPostingController = new JobPostingController();

// 求人検索（認証不要）
router.get('/search', jobPostingController.searchJobPostings);

// 求人詳細取得（認証不要）
router.get('/:id', jobPostingController.getJobPosting);

// 以下は認証が必要
router.use(authenticate);

// 求人作成（薬局のみ）
router.post(
  '/',
  requireUserType('pharmacy'),
  jobPostingController.createJobPosting
);

// 求人更新（薬局のみ）
router.put(
  '/:id',
  requireUserType('pharmacy'),
  jobPostingController.updateJobPosting
);

// 求人削除（薬局のみ）
router.delete(
  '/:id',
  requireUserType('pharmacy'),
  jobPostingController.deleteJobPosting
);

// 求人公開（薬局のみ）
router.post(
  '/:id/publish',
  requireUserType('pharmacy'),
  jobPostingController.publishJobPosting
);

// 求人非公開（薬局のみ）
router.post(
  '/:id/unpublish',
  requireUserType('pharmacy'),
  jobPostingController.unpublishJobPosting
);

// 薬局の求人一覧取得
router.get('/pharmacy/:pharmacyId', jobPostingController.getPharmacyJobPostings);

export default router;

