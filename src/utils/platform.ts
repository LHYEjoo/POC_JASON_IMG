// Platform detection utilities
export const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

export const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

export const isMobileChrome = /Android.*Chrome/i.test(navigator.userAgent);

export const isChromeIOS = /CriOS/.test(navigator.userAgent);
