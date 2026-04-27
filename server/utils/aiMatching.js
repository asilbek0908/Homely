// worker scoring — each factor adds points, max total is 100

const getMatchScore = (worker, request) => {
  let score = 0;

  // matching service is the most important factor
  if (worker.services?.includes(request.serviceType)) {
    score += 40;
  }

  // rating matters a lot, but new workers get a fair shot
  if (worker.totalReviews === 0) {
    score += 15; // new worker bonus
  } else {
    score += Math.round((worker.rating / 5) * 30);
  }

  // same district = full points, same city = half
  if (request.district && worker.location?.district === request.district) {
    score += 20;
  } else if (worker.location?.city === 'Tashkent') {
    score += 10;
  }

  // small bonus for experience
  const exp = worker.experience || 0;
  if (exp >= 5) score += 10;
  else if (exp >= 3) score += 7;
  else if (exp >= 1) score += 4;
  else score += 1;

  return Math.min(100, Math.round(score));
};

const getMatchReasons = (worker, request, score) => {
  const reasons = [];

  if (worker.services?.includes(request.serviceType)) {
    reasons.push(`Specializes in ${request.serviceType}`);
  }
  if (worker.rating >= 4.5 && worker.totalReviews > 0) {
    reasons.push(`Highly rated — ${worker.rating.toFixed(1)}★ from ${worker.totalReviews} reviews`);
  } else if (worker.rating >= 4 && worker.totalReviews > 0) {
    reasons.push(`${worker.rating.toFixed(1)}★ rating from ${worker.totalReviews} reviews`);
  }
  if (worker.location?.district === request.district) {
    reasons.push(`Works in your district (${request.district})`);
  }
  if (worker.experience >= 3) {
    reasons.push(`${worker.experience} years of experience`);
  }
  if (worker.totalJobs >= 10) {
    reasons.push(`Completed ${worker.totalJobs}+ jobs`);
  }
  if (worker.isVerified) {
    reasons.push('Verified by Homely team');
  }
  if (score >= 80) {
    reasons.push('Perfect match for your request');
  }
  if (worker.totalReviews === 0) {
    reasons.push('New worker — fresh start, competitive rates');
  }

  // making sure there's always something to show the user
  if (reasons.length < 2) {
    reasons.push('Available in Tashkent');
    if (reasons.length < 2) reasons.push('Registered on Homely platform');
  }

  return reasons.slice(0, 4);
};

const getTopMatches = (workers, request) => {
  const scored = workers.map((worker) => {
    const score = getMatchScore(worker, request);
    const reasons = getMatchReasons(worker, request, score);
    return { ...worker.toObject(), score, matchReasons: reasons };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
};

module.exports = { getMatchScore, getMatchReasons, getTopMatches };
