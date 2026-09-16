import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("mfe-body")).toBeVisible();
  await expect(page.getByTestId("mfe-brain")).toBeVisible();
  await expect(page.getByTestId("mfe-signal")).toBeVisible();
  await expect(page.getByTestId("mfe-decoder")).toBeVisible();
  await expect(page.getByText("Estado: Calibrado")).toBeVisible();
});

test("el shell carga los cuatro micro frontends", async ({ page }) => {
  await expect(page.getByTestId("app-header")).toContainText("NeuroMFE");
  await expect(page.getByText("SIMULACIÓN", { exact: true })).toBeVisible();
});

test("mano derecha produce el comando de mano derecha", async ({ page }) => {
  await page.getByTestId("task-RIGHT_HAND").click();
  await expect(page.getByTestId("classification-result")).toContainText("Mover mano derecha");
});

test("mano izquierda produce el comando de mano izquierda", async ({ page }) => {
  await page.getByTestId("task-LEFT_HAND").click();
  await expect(page.getByTestId("classification-result")).toContainText("Mover mano izquierda");
});

test("pies produce el comando de pies", async ({ page }) => {
  await page.getByTestId("task-FEET").click();
  await expect(page.getByTestId("classification-result")).toContainText("Mover pies");
});

test("el modo arquitectura muestra los nombres de los MFEs", async ({ page }) => {
  await page.getByTestId("toggle-architecture").click();
  await expect(page.getByTestId("architecture-status")).toContainText("Body MFE");
  await expect(page.getByTestId("architecture-status")).toContainText("Brain MFE");
  await expect(page.getByTestId("architecture-status")).toContainText("Signal MFE");
  await expect(page.getByTestId("architecture-status")).toContainText("Decoder MFE");
  await expect(page.getByTestId("event-monitor")).toBeVisible();
});

test("el modo BCI revela el ground truth después de clasificar", async ({ page }) => {
  await page.getByTestId("mode-bci").click();
  await page.getByTestId("new-bci-trial").click();
  await expect(page.getByTestId("classification-result")).toContainText(/Mover|Reposo/);
  await expect(page.getByTestId("ground-truth")).toContainText(/CORRECTA|NO COINCIDE/);
});
