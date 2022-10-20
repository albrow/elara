#[cfg(feature = "wasm")]
/// A macro to provide `println!(..)`-style syntax for `console.log` logging.
macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
}

#[cfg(not(feature = "wasm"))]
/// A macro to provide `println!(..)`-style syntax for `console.log` logging.
macro_rules! log {
    // On non-wasm platforms, just use println!
    ( $( $t:tt )* ) => {
        println!( $( $t )* );
    }
}
