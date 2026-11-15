import { useEffect, useRef } from 'react';
import { LetterCard } from '../grid/LetterCard';

export function Info(props: {
  visible: boolean;
  setVisible: (v: boolean) => void;
  hardMode: boolean;
}) {
  const { ref, hide } = useInfo(props.visible, props.setVisible);
  return (
    <dialog ref={ref} className="max-w-[430px] rounded-lg p-7">
      {props.hardMode ? <HardModeContent /> : <RegularContent />}
      <div className="flex justify-end">
        <button
          onClick={hide}
          className="rounded-md bg-neutral-300 p-2 font-bold active:bg-neutral-500"
        >
          Back to Curdling
        </button>
      </div>
    </dialog>
  );
}

function useInfo(visible: boolean, setVisible: (v: boolean) => void) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (visible) {
      ref.current?.showModal();
    }
  }, [visible]);

  function hide() {
    ref.current?.close();
    setVisible(false);
  }

  return { ref, hide };
}

function RegularContent() {
  return (
    <div>
      <h1 className="text-xl font-bold">Welcome to Curdle.</h1>
      <br />
      <p>
        Curdle is Wordle that doesn't want you to win. Instead of picking an
        answer at the start and sticking with it, Curdle waits for you to guess
        and works against you to the bitter end.
      </p>
      <br />
      <div>
        If you see the green number tile{' '}
        <div className="inline-block">
          <LetterCard letter="?" color="green" fontSize="text-base" />
        </div>{' '}
        then you've solved the Curdle in the fewest possible guesses!
      </div>
      <br />
      <p>Happy Curdling!</p>
      <br />
    </div>
  );
}

function HardModeContent() {
  return (
    <div>
      <h1 className="text-xl font-bold">Welcome to Hard Mode.</h1>
      <br />
      <p>Obscure words and plurals are now in.</p>
      <br />
      <p>Happy Curdling!</p>
      <br />
    </div>
  );
}
