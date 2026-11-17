// کوچک‌کردن عکس در مرورگر قبل از آپلود (خروجی JPEG)
export const toBlob = (f, max) => new Promise(res => {
  const u = URL.createObjectURL(f), i = new Image();
  i.onload = () => {
    const k = Math.min(1, max / i.width), c = document.createElement('canvas');
    c.width = Math.round(i.width * k);
    c.height = Math.round(i.height * k);
    c.getContext('2d').drawImage(i, 0, 0, c.width, c.height);
    URL.revokeObjectURL(u);
    c.toBlob(b => res(b), 'image/jpeg', .86);
  };
  i.onerror = () => res(null);
  i.src = u;
});
