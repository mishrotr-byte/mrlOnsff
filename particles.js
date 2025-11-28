document.addEventListener('pointermove', e => {
  if (Math.random() > 0.3) return;
  const cube = document.createElement('div');
  cube.className = 'cube';
  cube.style.left = (e.clientX - 6) + 'px';
  cube.style.top = (e.clientY - 6) + 'px';
  document.getElementById('particles').appendChild(cube);
  setTimeout(() => cube.remove(), 4000);
});
