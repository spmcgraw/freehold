```python
import subprocess
import sys

def test_marrow_cli():
    result = subprocess.run([sys.executable, "-m", "marrow", "--help"])
    assert result.returncode == 0
```