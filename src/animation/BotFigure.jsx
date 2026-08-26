import React, { useRef } from "react";
import { ACCENT, PALE } from "./scenes";

export const BIT_GLOW = "#7ed9c0";
export const BIT_TEAL = "#3d9b8f";
export const BIT_SHELL = "#1a3d42";
export const BIT_LIGHT = "#d8f4ee";

export const useBotParts = () => ({
  rig: useRef(),
  bob: useRef(),
  chassis: useRef(),
  head: useRef(),
  visor: useRef(),
  halo: useRef(),
  shell: useRef(),
  antenna: useRef(),
  lamp: useRef(),
  armL: useRef(),
  armR: useRef(),
  foreL: useRef(),
  foreR: useRef(),
  legL: useRef(),
  legR: useRef(),
  shinL: useRef(),
  shinR: useRef(),
});

/**
 * Shared joints. Pixel is the stocky builder with goggles and ear fins.
 * Bit is the slimmer teacher with a round visor and one aerial.
 */
export const BotFigure = ({
  parts,
  skin,
  trim,
  glow = ACCENT,
  pale = PALE,
  scale = 1,
  look = "pixel",
  children,
}) => {
  const builder = look === "pixel";

  return (
    <group ref={parts.rig} scale={scale}>
      <group ref={parts.bob}>
        <group ref={parts.chassis}>
          <pointLight ref={parts.lamp} color={glow} distance={5} intensity={1} />

          <mesh material={skin} scale={builder ? [1.1, 0.92, 1.04] : [0.86, 1.08, 0.9]}>
            <capsuleGeometry args={builder ? [0.21, 0.2, 4, 16] : [0.16, 0.26, 4, 16]} />
          </mesh>

          {builder ? (
            <mesh position={[0, 0.02, 0.17]} rotation={[0.15, 0, 0]}>
              <boxGeometry args={[0.24, 0.14, 0.04]} />
              <meshStandardMaterial
                color={glow}
                emissive={glow}
                emissiveIntensity={0.45}
                toneMapped={false}
              />
            </mesh>
          ) : null}

          {builder ? (
            <>
              <mesh position={[0, -0.1, 0]} rotation={[1.57, 0, 0]}>
                <torusGeometry args={[0.23, 0.028, 8, 20]} />
                <meshStandardMaterial
                  color={glow}
                  emissive={glow}
                  emissiveIntensity={0.35}
                  toneMapped={false}
                />
              </mesh>
              <group position={[0.22, -0.14, 0.1]} rotation={[0.35, 0.5, 0.9]}>
                <mesh>
                  <boxGeometry args={[0.035, 0.16, 0.035]} />
                  <meshBasicMaterial color={pale} />
                </mesh>
                <mesh position={[0, -0.1, 0]}>
                  <boxGeometry args={[0.09, 0.045, 0.035]} />
                  <meshBasicMaterial color={glow} />
                </mesh>
              </group>
            </>
          ) : null}

          <mesh position={[0, builder ? -0.26 : -0.3, 0]} material={trim}>
            <cylinderGeometry args={builder ? [0.17, 0.19, 0.07, 12] : [0.12, 0.14, 0.08, 12]} />
          </mesh>

          <group ref={parts.head} position={[0, builder ? 0.4 : 0.46, 0]}>
            {builder ? (
              <mesh material={skin}>
                <boxGeometry args={[0.44, 0.32, 0.38]} />
              </mesh>
            ) : (
              <mesh material={skin} scale={[0.92, 1, 0.92]}>
                <sphereGeometry args={[0.21, 24, 24]} />
              </mesh>
            )}

            {builder ? (
              <>
                <mesh position={[0, 0.16, 0.02]} rotation={[0.4, 0, 0]}>
                  <boxGeometry args={[0.44, 0.055, 0.36]} />
                  <meshBasicMaterial color={pale} transparent opacity={0.92} />
                </mesh>
                <mesh position={[0, 0.01, 0]} rotation={[1.57, 0, 0]}>
                  <torusGeometry args={[0.2, 0.022, 6, 18]} />
                  <meshBasicMaterial color={pale} transparent opacity={0.55} />
                </mesh>
                <mesh ref={parts.visor} position={[0, 0.01, 0.175]} scale={[0.52, 0.16, 0.14]}>
                  <boxGeometry args={[1, 1, 1]} />
                  <meshStandardMaterial
                    color={glow}
                    emissive={glow}
                    emissiveIntensity={1.2}
                    toneMapped={false}
                  />
                </mesh>
              </>
            ) : (
              <mesh ref={parts.visor} position={[0, 0.02, 0.155]} scale={[0.4, 0.26, 0.2]}>
                <sphereGeometry args={[0.5, 20, 20]} />
                <meshStandardMaterial
                  color={glow}
                  emissive={glow}
                  emissiveIntensity={1.2}
                  toneMapped={false}
                />
              </mesh>
            )}

            <group ref={parts.antenna} position={[0, builder ? 0.12 : 0.19, 0]}>
              {builder ? (
                <>
                  <mesh position={[-0.17, 0.04, 0]} rotation={[0, 0, 0.7]}>
                    <coneGeometry args={[0.045, 0.16, 8]} />
                    <meshBasicMaterial color={pale} transparent opacity={0.85} />
                  </mesh>
                  <mesh position={[0.17, 0.04, 0]} rotation={[0, 0, -0.7]}>
                    <coneGeometry args={[0.045, 0.16, 8]} />
                    <meshBasicMaterial color={pale} transparent opacity={0.85} />
                  </mesh>
                  <mesh position={[-0.2, 0.1, 0]}>
                    <sphereGeometry args={[0.032, 10, 10]} />
                    <meshStandardMaterial
                      color={glow}
                      emissive={glow}
                      emissiveIntensity={1.3}
                      toneMapped={false}
                    />
                  </mesh>
                  <mesh position={[0.2, 0.1, 0]}>
                    <sphereGeometry args={[0.032, 10, 10]} />
                    <meshStandardMaterial
                      color={glow}
                      emissive={glow}
                      emissiveIntensity={1.3}
                      toneMapped={false}
                    />
                  </mesh>
                </>
              ) : (
                <>
                  <mesh position={[0, 0.11, 0]}>
                    <cylinderGeometry args={[0.011, 0.011, 0.22, 6]} />
                    <meshBasicMaterial color={pale} transparent opacity={0.7} />
                  </mesh>
                  <mesh position={[0, 0.24, 0]}>
                    <sphereGeometry args={[0.045, 14, 14]} />
                    <meshStandardMaterial
                      color={glow}
                      emissive={glow}
                      emissiveIntensity={1.4}
                      toneMapped={false}
                    />
                  </mesh>
                </>
              )}
            </group>
          </group>

          <group ref={parts.armL} position={[builder ? -0.27 : -0.22, 0.16, 0]}>
            <mesh position={[0, -0.13, 0]} material={skin}>
              <capsuleGeometry args={[builder ? 0.048 : 0.04, 0.14, 4, 10]} />
            </mesh>
            <group ref={parts.foreL} position={[0, -0.26, 0]}>
              <mesh position={[0, -0.11, 0]} material={skin}>
                <capsuleGeometry args={[builder ? 0.042 : 0.036, 0.13, 4, 10]} />
              </mesh>
              <mesh position={[0, -0.23, 0]} material={trim}>
                {builder ? <boxGeometry args={[0.1, 0.08, 0.1]} /> : <sphereGeometry args={[0.058, 12, 12]} />}
              </mesh>
            </group>
          </group>

          <group ref={parts.armR} position={[builder ? 0.27 : 0.22, 0.16, 0]}>
            <mesh position={[0, -0.13, 0]} material={skin}>
              <capsuleGeometry args={[builder ? 0.048 : 0.04, 0.14, 4, 10]} />
            </mesh>
            <group ref={parts.foreR} position={[0, -0.26, 0]}>
              <mesh position={[0, -0.11, 0]} material={skin}>
                <capsuleGeometry args={[builder ? 0.042 : 0.036, 0.13, 4, 10]} />
              </mesh>
              <mesh position={[0, -0.23, 0]} material={trim}>
                {builder ? <boxGeometry args={[0.1, 0.08, 0.1]} /> : <sphereGeometry args={[0.058, 12, 12]} />}
              </mesh>
            </group>
          </group>

          <group ref={parts.legL} position={[-0.1, builder ? -0.28 : -0.3, 0]}>
            <mesh position={[0, -0.12, 0]} material={skin}>
              <capsuleGeometry args={[0.048, 0.13, 4, 10]} />
            </mesh>
            <group ref={parts.shinL} position={[0, -0.25, 0]}>
              <mesh position={[0, -0.11, 0]} material={skin}>
                <capsuleGeometry args={[0.041, 0.12, 4, 10]} />
              </mesh>
              <mesh position={[0, -0.22, 0.03]} material={trim}>
                <boxGeometry args={builder ? [0.11, 0.05, 0.16] : [0.09, 0.05, 0.14]} />
              </mesh>
            </group>
          </group>

          <group ref={parts.legR} position={[0.1, builder ? -0.28 : -0.3, 0]}>
            <mesh position={[0, -0.12, 0]} material={skin}>
              <capsuleGeometry args={[0.048, 0.13, 4, 10]} />
            </mesh>
            <group ref={parts.shinR} position={[0, -0.25, 0]}>
              <mesh position={[0, -0.11, 0]} material={skin}>
                <capsuleGeometry args={[0.041, 0.12, 4, 10]} />
              </mesh>
              <mesh position={[0, -0.22, 0.03]} material={trim}>
                <boxGeometry args={builder ? [0.11, 0.05, 0.16] : [0.09, 0.05, 0.14]} />
              </mesh>
            </group>
          </group>

          {children}

          <mesh ref={parts.halo} rotation={[1.2, 0, 0]}>
            <torusGeometry args={[builder ? 0.68 : 0.56, 0.016, 12, 44]} />
            <meshBasicMaterial color={pale} transparent opacity={0.5} toneMapped={false} />
          </mesh>

          <mesh ref={parts.shell}>
            <icosahedronGeometry args={[builder ? 0.88 : 0.74, 1]} />
            <meshBasicMaterial color={glow} wireframe transparent opacity={0.04} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
