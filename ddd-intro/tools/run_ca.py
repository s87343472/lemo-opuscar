"""Run a Python tool with certifi pointed at the agent proxy's CA bundle (edge-tts pins certifi)."""
import runpy, sys, certifi
certifi.where = lambda: '/root/.ccr/ca-bundle.crt'
sys.argv = sys.argv[1:]
runpy.run_path(sys.argv[0], run_name='__main__')
