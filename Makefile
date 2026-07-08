# ==============================================================================
# DMGTTM Development Commands
# ==============================================================================

.PHONY: server
server: ## Start the backend server
	@echo "Starting DMGTTM server..."
	@python server_main.py --port 6400

.PHONY: client
client: ## Start the frontend development server
	@cd frontend && npx cross-env VITE_API_BASE_URL=http://localhost:6400 npm run dev

.PHONY: dev
dev: ## Run both backend and frontend development servers
	@$(MAKE) -j2 server client

.PHONY: test
test: ## Run backend tests
	@python -m pytest -v

.PHONY: stop
stop: ## Stop servers
	@echo "Stopping DMGTTM server (port 6400)..."
	@npx kill-port 6400 2>nul || echo "Port 6400 not in use"
	@echo "Stopping frontend server (port 5173)..."
	@npx kill-port 5173 2>nul || echo "Port 5173 not in use"
