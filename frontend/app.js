document.getElementById('btn').addEventListener('click', async () => {
  const res = await fetch('/test-db');
  const t = await res.text();
  document.getElementById('out').textContent = t;
});