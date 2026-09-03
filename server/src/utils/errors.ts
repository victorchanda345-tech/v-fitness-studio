import { Request, Response, NextFunction } from 'express';

/** Safely parse numeric route parameters regardless of Express 4/5 string | string[] type */
export function getIdParam(val: string | string[] | undefined): number {
  if (!val) return NaN;
  const str = Array.isArray(val) ? val[0] : val;
  return parseInt(str, 10);
}

/** Standardised error response shape */
export function errorResponse(res: Response, status: number, message: string) {
  return res.status(status).json({ error: message });
}

/** Wrap an async route handler so thrown errors become 500s instead of crashes */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((err: unknown) => {
      console.error('Unhandled route error:', err);
      errorResponse(res, 500, 'Internal server error');
    });
  };
}
